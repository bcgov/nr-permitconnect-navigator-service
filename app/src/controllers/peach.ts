import { getLogger } from '../components/log';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateUpdateStamps } from '../db/utils/utils';
import { parsePeachRecords, summarizeRecord } from '../parsers/peachParser';
import { getPeachRecord } from '../services/peach';
import { searchPermits, upsertPermit } from '../services/permit';
import { compareDates, omit } from '../utils';
import { PEACH_INTEGRATED_SYSTEMS } from '../utils/constants/permit';
import { PeachIntegratedSystem } from '../utils/enums/permit';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { PeachSummary, Permit, Record as PeachRecord, PermitTracking } from '../types';

const log = getLogger(module.filename);

/**
 * Tracking priority for which tracking ids to use, priority is inferred by order of array
 */
const PEACH_TRACKING_PRIORITY = [
  {
    sourceSystem: PeachIntegratedSystem.TANTALIS,
    trackingName: 'Disposition Transaction ID'
  },
  {
    sourceSystem: PeachIntegratedSystem.WMA,
    trackingName: 'Job Number'
  },
  {
    sourceSystem: PeachIntegratedSystem.VFCBC,
    trackingName: 'Tracking Number'
  }
];

/**
 * Fetches PEACH data for permit tracking
 */
export const getPeachRecordController = async (req: Request<{ recordId: string; systemId: string }>, res: Response) => {
  const response = await getPeachRecord(req.params.recordId, req.params.systemId);

  const peachSummary: PeachSummary = summarizeRecord(response);

  res.status(200).json(peachSummary);
};

/**
 * Syncs PEACH data for permit tracking to PCNS
 */
export const syncPeachRecords = async () => {
  const systemRecordPermits: { recordId: string; systemId: string; permit: Permit }[] = [];
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    // Only fetch permits that have tracking with peach integrated systems
    const peachIntegratedPermits: Permit[] = await searchPermits(tx, {
      sourceSystems: PEACH_INTEGRATED_SYSTEMS,
      includePermitTracking: true
    });

    // Find permits that have a permit tracking from a PEACH integrataed system
    for (const permit of peachIntegratedPermits) {
      const permitTrackings = permit.permitTracking ?? [];

      if (permitTrackings.length === 0) continue;

      let permitTracking: PermitTracking | undefined;
      let priorityIndex = PEACH_TRACKING_PRIORITY.length;

      // Prioritize which PEACH integrated permit tracking to use
      for (const pt of permitTrackings) {
        const sourceSystem = pt.sourceSystemKind?.sourceSystem;
        const trackingName = pt.sourceSystemKind?.description;
        if (!sourceSystem) continue;

        const index = PEACH_TRACKING_PRIORITY.findIndex((ptp) => ptp.sourceSystem === sourceSystem);
        if (index === -1) continue;

        if (index > priorityIndex) continue;

        const trackingPriority = PEACH_TRACKING_PRIORITY[index];
        if (trackingPriority.trackingName && trackingPriority.trackingName !== trackingName) continue;

        permitTracking = pt;
        priorityIndex = index;
      }

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

  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    for (const systemRecordPermit of systemRecordPermits) {
      const { recordId, systemId, permit: pcnsPermit } = systemRecordPermit;
      const systemRecordId = systemId + recordId;
      const peachPermit = parsedRecords[systemRecordId];

      if (!peachPermit) continue;

      // If parser didn't return proper status mappings skip upsert
      if (peachPermit.stage === undefined || peachPermit.state === undefined) {
        continue;
      }

      const submittedDatesEqual =
        compareDates(peachPermit.submittedDate ?? undefined, pcnsPermit.submittedDate ?? undefined) === 0;
      const ajudicationDatesEqual =
        compareDates(peachPermit.adjudicationDate ?? undefined, pcnsPermit.adjudicationDate ?? undefined) === 0;
      const lastChangedDatesEqual =
        compareDates(peachPermit.statusLastChanged, pcnsPermit.statusLastChanged ?? undefined) === 0;
      const statesEqual = peachPermit.state === pcnsPermit.state;
      const stagesEqual = peachPermit.stage === pcnsPermit.stage;

      const hasDiff =
        !stagesEqual || !statesEqual || !submittedDatesEqual || !ajudicationDatesEqual || !lastChangedDatesEqual;

      if (!hasDiff) continue;

      pcnsPermit.state = peachPermit.state;
      pcnsPermit.stage = peachPermit.stage;
      pcnsPermit.statusLastChanged = peachPermit.statusLastChanged;
      if (peachPermit.submittedDate) pcnsPermit.submittedDate = peachPermit.submittedDate;
      if (peachPermit.adjudicationDate) pcnsPermit.adjudicationDate = peachPermit.adjudicationDate;

      // Don't update lastVerified if current value is after PEACH's status change
      // Means that PCNS (a Navigator) has manually updated it since PEACH update
      const lastVerifiedBeforeStatusChange =
        compareDates(pcnsPermit.statusLastVerified ?? undefined, peachPermit.statusLastChanged) < 0;

      if (lastVerifiedBeforeStatusChange) pcnsPermit.statusLastVerified = peachPermit.statusLastChanged;

      const { updatedBy, updatedAt } = generateUpdateStamps(undefined);
      pcnsPermit.updatedAt = updatedAt;
      pcnsPermit.updatedBy = updatedBy;

      const cleanedPermit = omit(pcnsPermit, ['permitTracking']);

      await upsertPermit(tx, cleanedPermit);
    }
  });
};
