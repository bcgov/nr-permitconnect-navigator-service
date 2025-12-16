import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateUpdateStamps } from '../db/utils/utils';
import { parsePeachRecords, summarizePeachRecord } from '../parsers/peachParser';
import { getPeachRecord } from '../services/peach';
import { searchPermits, upsertPermit } from '../services/permit';
import { combineDateTime, compareDates, omit, Problem } from '../utils';
import { getLogger } from '../utils/log';
import { PeachIntegratedSystem } from '../utils/enums/permit';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { PeachSummary, Permit, Record as PeachRecord, PermitTracking } from '../types';

const log = getLogger(module.filename);

/**
 * Tracking priority for which tracking ids to use, priority is inferred by order of array
 */
const PEACH_TRACKING_PRIORITY = [
  PeachIntegratedSystem.TANTALIS,
  PeachIntegratedSystem.WMA,
  PeachIntegratedSystem.VFCBC,
  PeachIntegratedSystem.ATS
];

/**
 * Finds the permit tracking with the highest priority, used for fetching PEACH data
 */
const findPriorityPermitTracking = (permitTrackings: PermitTracking[]): PermitTracking | undefined => {
  let permitTracking: PermitTracking | undefined;
  let priorityIndex = PEACH_TRACKING_PRIORITY.length;

  // Prioritize which PEACH integrated permit tracking to use
  for (const pt of permitTrackings) {
    if (!pt.sourceSystemKind?.integrated) continue;
    const sourceSystem = pt.sourceSystemKind.sourceSystem as PeachIntegratedSystem;

    const index = PEACH_TRACKING_PRIORITY.indexOf(sourceSystem);
    if (index === -1) continue;

    if (index > priorityIndex) continue;

    permitTracking = pt;
    priorityIndex = index;
  }

  return permitTracking;
};

/**
 * Fetches PEACH data for permit tracking
 */
export const getPeachSummaryController = async (req: Request<never, never, PermitTracking[], never>, res: Response) => {
  const permitTracking = findPriorityPermitTracking(req.body);

  if (!permitTracking?.trackingId || !permitTracking?.sourceSystemKind?.sourceSystem) {
    throw new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' });
  }

  const response = await getPeachRecord(permitTracking.trackingId, permitTracking.sourceSystemKind.sourceSystem);
  const peachSummary = summarizePeachRecord(response);

  if (!peachSummary)
    throw new Problem(422, { detail: 'No status data could be derived from the PEACH record that was found.' });

  res.status(200).json(peachSummary);
};

/**
 * Syncs PEACH data for permit tracking to PCNS, returns a list of permits used for sending update notifications
 */
export const syncPeachRecords = async (): Promise<Permit[]> => {
  const systemRecordPermits: { recordId: string; systemId: string; permit: Permit }[] = [];
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    // Only fetch permits that have a peach integrated system permit type
    const peachIntegratedPermits: Permit[] = await searchPermits(tx, {
      includePermitTracking: true,
      onlyPeachIntegratedTrackings: true
    });

    // Find permits that have a permit tracking from a PEACH integrataed system
    for (const permit of peachIntegratedPermits) {
      const permitTrackings = permit.permitTracking ?? [];

      if (permitTrackings.length === 0) continue;

      const permitTracking = findPriorityPermitTracking(permitTrackings);

      if (!permitTracking) continue;

      const recordId = permitTracking.trackingId;
      const systemId = permitTracking.sourceSystemKind!.sourceSystem;

      if (recordId && systemId) {
        systemRecordPermits.push({
          recordId,
          systemId,
          permit: permit
        });
      }
    }
  });

  // TODO: May need rate limiting in the future
  const results = await Promise.allSettled(
    systemRecordPermits.map((srp) => getPeachRecord(srp.recordId, srp.systemId))
  );

  const records: PeachRecord[] = [];
  const failures: { index: number; reason: unknown }[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') records.push(result.value);
    else failures.push({ index: index, reason: result.reason });
  });

  log.verbose('PEACH fetch summary', {
    total: results.length,
    fetched: records.length,
    failed: failures.length
  });

  if (failures.length) {
    for (const failure of failures) {
      const { recordId, systemId } = systemRecordPermits[failure.index];
      log.warn('PEACH fetch failed', { recordId, systemId, error: failure.reason });
    }
  }

  const parsedRecords: Record<string, PeachSummary> = parsePeachRecords(records);

  const updatedPermits: Permit[] = [];

  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    for (const systemRecordPermit of systemRecordPermits) {
      const { recordId, systemId, permit: pcnsPermit } = systemRecordPermit;
      const systemRecordId = systemId + recordId;
      const peachSummary = parsedRecords[systemRecordId];

      if (!peachSummary) continue;

      const peachSubmittedDatetime = combineDateTime(peachSummary.submittedDate, peachSummary.submittedTime);
      const peachDecisionDatetime = combineDateTime(peachSummary.decisionDate, peachSummary.decisionTime);
      const peachStatusChangedDatetime = combineDateTime(
        peachSummary.statusLastChanged,
        peachSummary.statusLastChangedTime
      );
      const pcnsSubmittedDatetime = combineDateTime(pcnsPermit.submittedDate, pcnsPermit.submittedTime);
      const pcnsDecisionDatetime = combineDateTime(pcnsPermit.decisionDate, pcnsPermit.decisionTime);
      const pcnsStatusChangedDatetime = combineDateTime(pcnsPermit.statusLastChanged, pcnsPermit.statusLastChangedTime);
      const pcnsLastVerifiedDatetime = combineDateTime(
        pcnsPermit.statusLastVerified,
        pcnsPermit.statusLastVerifiedTime
      );

      // Check differentials for PEACH vs PCNS status data
      const submittedDatesEqual = compareDates(peachSubmittedDatetime, pcnsSubmittedDatetime) === 0;
      const decisionDatesEqual = compareDates(peachDecisionDatetime, pcnsDecisionDatetime) === 0;
      const lastChangedDatesEqual = compareDates(peachStatusChangedDatetime, pcnsStatusChangedDatetime) === 0;
      const stagesEqual = peachSummary.stage === pcnsPermit.stage;
      const statesEqual = peachSummary.state === pcnsPermit.state;

      const hasDiff =
        !stagesEqual || !statesEqual || !submittedDatesEqual || !decisionDatesEqual || !lastChangedDatesEqual;

      if (!hasDiff) continue;

      pcnsPermit.stage = peachSummary.stage;
      pcnsPermit.state = peachSummary.state;

      pcnsPermit.submittedDate = peachSummary.submittedDate;
      pcnsPermit.submittedTime = peachSummary.submittedTime;

      pcnsPermit.decisionDate = peachSummary.decisionDate;
      pcnsPermit.decisionTime = peachSummary.decisionTime;

      pcnsPermit.statusLastChanged = peachSummary.statusLastChanged;
      pcnsPermit.statusLastChangedTime = peachSummary.statusLastChangedTime;

      // Only update pcns' last verified date if current value is before peach status change
      const lastVerifiedBeforeStatusChange = compareDates(pcnsLastVerifiedDatetime, peachStatusChangedDatetime) < 0;

      if (lastVerifiedBeforeStatusChange) {
        pcnsPermit.statusLastVerified = peachSummary.statusLastChanged;
        pcnsPermit.statusLastVerifiedTime = peachSummary.statusLastChangedTime;
      }

      const { updatedBy, updatedAt } = generateUpdateStamps(undefined);
      pcnsPermit.updatedAt = updatedAt;
      pcnsPermit.updatedBy = updatedBy;

      const cleanedPermit = omit(pcnsPermit, ['permitTracking', 'permitType']);

      const updatedPermit = await upsertPermit(tx, cleanedPermit);

      // Only return permits and notes that have had a status change for notifications
      if (!stagesEqual || !statesEqual) updatedPermits.push(updatedPermit);
    }
  });

  return updatedPermits;
};
