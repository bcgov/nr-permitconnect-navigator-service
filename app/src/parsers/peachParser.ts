import { compareDates } from '../utils';
import { PeachTerminatedStage, PermitPhase, PermitStage, PermitState } from '../utils/enums/permit';

import type {
  Code,
  CodingEvent,
  Record as PeachRecord,
  Event as PiesEvent,
  PeachSummary,
  ProcessEvent
} from '../types';

// Mappings for PEACH codes to PCNS display values
const STATUS_MAPPINGS: Record<string, { stage: PermitStage; state: PermitState }> = {
  // Application Submission - Initial Review
  'PRE_APPLICATION:SUBMITTED': {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.INITIAL_REVIEW
  },
  'INITIAL_SUBMISSION_REVIEW:SUBMISSION_REVIEW': {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.INITIAL_REVIEW
  },

  // Technical Review - In Progress
  'TECH_REVIEW_COMMENT:TECHNICAL_REVIEW': {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },
  'TECH_REVIEW_COMMENT:REFERRAL': {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },
  'TECH_REVIEW_COMMENT:FIRST_NATIONS_CONSULTATION': {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },
  'TECH_REVIEW_COMMENT:TECH_REVIEW_COMPLETED': {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },

  // Pending Decision - In Progess
  'DECISION:DECISION_REVIEW': {
    stage: PermitStage.PENDING_DECISION,
    state: PermitState.IN_PROGRESS
  },

  // Post Decision
  // Approved
  'DECISION:ALLOWED': {
    stage: PermitStage.POST_DECISION,
    state: PermitState.APPROVED
  },
  'ISSUANCE:OFFERED': {
    stage: PermitStage.POST_DECISION,
    state: PermitState.APPROVED
  },
  // Denied
  'DECISION:DISALLOWED': {
    stage: PermitStage.POST_DECISION,
    state: PermitState.DENIED
  },
  'ISSUANCE:DECLINED': {
    stage: PermitStage.POST_DECISION,
    state: PermitState.DENIED
  },
  // Issued
  'ISSUANCE:ISSUED': {
    stage: PermitStage.POST_DECISION,
    state: PermitState.ISSUED
  },

  // Terminal stages
  // Rejected
  'INITIAL_SUBMISSION_REVIEW:REJECTED': {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.REJECTED
  },
  'TECH_REVIEW_COMMENT:REJECTED': {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.REJECTED
  },
  // Withdrawn
  'INITIAL_SUBMISSION_REVIEW:WITHDRAWN': {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.WITHDRAWN
  },
  'TECH_REVIEW_COMMENT:WITHDRAWN': {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.WITHDRAWN
  },
  'DECISION:WITHDRAWN': {
    stage: PermitStage.PENDING_DECISION,
    state: PermitState.WITHDRAWN
  }
};

const getRecordEvents = (
  record: PeachRecord,
  n: number = 0,
  m: number = 0
): { processEvent: ProcessEvent; onHoldEvent: CodingEvent } => {
  const processEvents = [...record.process_event_set].sort((a, b) =>
    compareDates(piesEventToDate(a.event), piesEventToDate(b.event), true)
  );
  const onHoldEvents = [...record.on_hold_event_set].sort((a, b) =>
    compareDates(piesEventToDate(a.event), piesEventToDate(b.event), true)
  );

  const processEvent = processEvents.length > n ? processEvents[n] : processEvents[0];
  const onHoldEvent = onHoldEvents.length > m ? onHoldEvents[m] : onHoldEvents[0];

  return { processEvent, onHoldEvent };
};

const generateStatus = (
  codes: Code[],
  record: PeachRecord
): { phase: PermitPhase; stage: PermitStage | undefined; state: PermitState | undefined } => {
  // Note: Placeholder for phase, still only one phase for permits in both PEACH and PCNS
  const phase = PermitPhase.APPLICATION;

  const stageCode = codes[1];
  const stateCode = codes[2];

  let statusKey: string;

  // If stage is terminal, get stage from previous process event and set PCNS state to be PEACH terminal stage
  if (stageCode in PeachTerminatedStage) {
    const { processEvent } = getRecordEvents(record, 1);
    const prevStageCode = processEvent.process.code_set[1] as string;
    statusKey = `${prevStageCode}:${codes[1]}`;
  } else {
    statusKey = `${stageCode}:${stateCode}`;
  }

  const mapping = STATUS_MAPPINGS[statusKey];

  const stage = mapping?.stage;
  const state = mapping?.state;

  return {
    phase,
    stage,
    state
  };
};

const piesEventToDate = (pe: PiesEvent): Date => {
  if ('start_datetime' in pe && pe.start_datetime) return new Date(pe.start_datetime);
  else return new Date(`${pe.start_date}T00:00:00.000Z`);
};

const equalsExact = (codes: Code[], exact: Code[]) =>
  codes.length === exact.length && codes.every((c, i) => c === exact[i]);

const startsWith = (codes: Code[], prefix: Code[]) => prefix.every((c, i) => codes[i] === c);

// Field finders
const findSubmittedDate = (rec: PeachRecord): Date | undefined => {
  for (const pe of rec.process_event_set) {
    if (equalsExact(pe.process.code_set, ['APPLICATION', 'PRE_APPLICATION', 'SUBMITTED'])) {
      return piesEventToDate(pe.event);
    }
  }
  return undefined;
};

const findDecisionDate = (rec: PeachRecord): Date | undefined => {
  for (const pe of rec.process_event_set) {
    const codes = pe.process.code_set;
    if (startsWith(codes, ['APPLICATION', 'DECISION']) || startsWith(codes, ['APPLICATION', 'ISSUANCE'])) {
      return piesEventToDate(pe.event);
    }
  }
  return undefined;
};

export function summarizeRecord(record: PeachRecord): PeachSummary {
  // Get latest process even
  const { processEvent } = getRecordEvents(record);
  // TODO: Implement logic, parsing, and mappings for "On Hold Events" once the data has been added to peach
  // May need following variables and if checks to see whether to set permit w/ process or onHold
  // const onHoldEnded = onHoldEvent.event.end_date || onHoldEvent.event.end_datetime; // check if dates too?
  // const onHoldStartDate = piesEventToDate(onHoldEvent.event);
  // const onHoldIsLatestEvent = compareDates(onHoldStartDate, processStartDate) > 0;

  // if (onHoldEnded || onHoldIsLatestEvent) {
  //   // set set permit values based on onHold
  // } else {
  //   // set set permit values based on process
  // }

  const { stage, state } = generateStatus(processEvent.process.code_set, record);
  const statusLastChanged = piesEventToDate(processEvent.event);
  const submittedDate = findSubmittedDate(record);
  const adjudicationDate = findDecisionDate(record);

  return { stage, state, submittedDate, adjudicationDate, statusLastChanged };
}

export function parsePeachRecords(records: readonly PeachRecord[]): Record<string, PeachSummary> {
  const parsedRecords: Record<string, PeachSummary> = {};
  for (const record of records) parsedRecords[record.system_id + record.record_id] = summarizeRecord(record);
  return parsedRecords;
}
