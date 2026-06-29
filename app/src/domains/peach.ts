import pLimit from 'p-limit';

import { listPeachIntegratedTrackings } from './permit.ts';
import { PermitStage, PermitState, PiesOnHold } from '../db/codes/enums.ts';
import { generateUpdateStamps } from '../db/utils/utils.ts';
import { getPeachRecord } from '../external/peach.ts';
import { parsePeachRecords } from '../parsers/peach.ts';
import { Repositories } from '../repository/unitOfWork.ts';
import { PeachIntegratedSystem } from '../utils/enums/permit';
import { combineDateTime, compareDates, omit } from '../utils/index.ts';
import { getLogger } from '../utils/log.ts';

import type { PeachSummary, Permit, PermitTracking, Record as PeachRecord, UpdatedPermitWithNote } from '../types';

const log = getLogger(module.filename);
const limit = pLimit(5);

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
 * @param permitTrackings Array of permit tracking objects
 * @returns The highest priority tracker
 */
export const findPriorityPermitTracking = (
  permitTrackings: PermitTracking[] | undefined
): PermitTracking | undefined => {
  let permitTracking: PermitTracking | undefined;
  let priorityIndex = PEACH_TRACKING_PRIORITY.length;

  if (!permitTrackings || permitTrackings.length === 0) return permitTracking;
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
 * Syncs PEACH data for permit tracking to PCNS, returns a list of permits used for sending update notifications
 * @param repositories - The required repositories
 * @returns Array of updated permits
 */
export const syncPeachRecords = async (
  repositories: Pick<Repositories, 'permit'>
): Promise<UpdatedPermitWithNote[]> => {
  const systemRecordPermits: { recordId: string; systemId: string; permit: Permit }[] = [];

  // Only fetch permits that have a peach integrated system permit type
  const peachIntegratedPermits = await listPeachIntegratedTrackings({ permit: repositories.permit });

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

  // Uses rate limiting with p-limit to avoid overwhelming PEACH with requests, limit is set to 5.
  const results = await Promise.allSettled(
    systemRecordPermits.map((srp) => limit(() => getPeachRecord(srp.recordId, srp.systemId)))
  );

  const records: PeachRecord[] = [];
  const errors: { index: number; reason: unknown }[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') records.push(result.value);
    else errors.push({ index: index, reason: result.reason });
  });

  log.verbose('PEACH fetch summary', {
    total: results.length,
    fetched: records.length,
    errored: errors.length
  });

  if (errors.length) {
    for (const error of errors) {
      const { recordId, systemId } = systemRecordPermits[error.index];
      log.warn('PEACH fetch call error:', { recordId, systemId, error: error.reason });
    }
  }

  const parsedRecords: Record<string, PeachSummary> = parsePeachRecords(records);

  const updatedPermits: UpdatedPermitWithNote[] = [];

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
    const pcnsLastVerifiedDatetime = combineDateTime(pcnsPermit.statusLastVerified, pcnsPermit.statusLastVerifiedTime);

    // Check differentials for PEACH vs PCNS status data
    const submittedDatesEqual = compareDates(peachSubmittedDatetime, pcnsSubmittedDatetime) === 0;
    const decisionDatesEqual = compareDates(peachDecisionDatetime, pcnsDecisionDatetime) === 0;
    const lastChangedDatesEqual = compareDates(peachStatusChangedDatetime, pcnsStatusChangedDatetime) === 0;
    const stagesEqual = peachSummary.stage === (pcnsPermit.stage as PermitStage);
    const statesEqual = peachSummary.state === (pcnsPermit.state as PermitState);
    const onHoldCodesEqual = peachSummary.onHoldCode === pcnsPermit.onHoldCode;

    const stageOrStateHasDiff = !stagesEqual || !statesEqual;
    const hasDiff =
      stageOrStateHasDiff || !onHoldCodesEqual || !submittedDatesEqual || !decisionDatesEqual || !lastChangedDatesEqual;

    if (!hasDiff) continue;

    pcnsPermit.stage = peachSummary.stage;
    pcnsPermit.state = peachSummary.state;
    pcnsPermit.onHoldCode = peachSummary.onHoldCode;

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

    const cleanedPermit = omit(pcnsPermit, ['activity', 'permitNote', 'permitTracking', 'permitType']);
    const updatedPermit = await repositories.permit.upsert(
      {
        permitId: cleanedPermit.permitId
      },
      cleanedPermit,
      cleanedPermit
    );
    const applicantRequestedHold = !onHoldCodesEqual && peachSummary.onHoldCode === PiesOnHold.APPLICANT_REQUEST;
    let note: string | undefined = undefined;

    if (applicantRequestedHold) {
      note = 'This application has been placed on hold at the applicant’s request';
    }

    // For notifications, only return permits that have had a status change or is now on hold by applicant's request.
    if (stageOrStateHasDiff || applicantRequestedHold) updatedPermits.push({ permit: updatedPermit, note });
  }

  return updatedPermits;
};
