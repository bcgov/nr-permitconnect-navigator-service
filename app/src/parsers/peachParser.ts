import { compareDates, splitDateTime } from '../utils';
import { PeachTerminatedStage, PermitPhase, PermitStage, PermitState } from '../utils/enums/permit';

import type {
  CodingEvent,
  Record as PeachRecord,
  Event as PiesEvent,
  NullableDateTimeStrings,
  PeachSummary,
  ProcessEvent,
  DateTimeStrings
} from '../types';

/**
 * Inferred process ordering from @see {@link https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process}
 */
const APPLICATION_PROCESS_ORDERING: string[] = [
  'APPLICATION',
  'PRE_APPLICATION',
  'DRAFT',
  'SUBMITTED',
  'INITIAL_SUBMISSION_REVIEW',
  'SUBMISSION_REVIEW',
  'TECH_REVIEW_COMMENT',
  'TECHNICAL_REVIEW',
  'REFERRAL',
  'FIRST_NATIONS_CONSULTATION',
  'TECH_REVIEW_COMPLETED',
  'DECISION',
  'DECISION_REVIEW',
  'ALLOWED',
  'DISALLOWED',
  'ISSUANCE',
  'OFFERED',
  'ISSUED',
  'DECLINED',
  'REJECTED',
  'WITHDRAWN'
];

/**
 * Inferred process ordering mapping
 */
const APPLICATION_PROCESS_ORDERING_MAP: Record<string, number> = APPLICATION_PROCESS_ORDERING.reduce(
  (acc, code, index) => {
    acc[code] = index;
    return acc;
  },
  {} as Record<string, number>
);

const PEACH_DECISION_STATES = ['ALLOWED', 'DISALLOWED', 'OFFERED', 'ISSUED', 'DECLINED'];

const PEACH_SUBMITTED_STATE = 'SUBMITTED';

/**
 * Mappings for PEACH codes to PCNS display values
 */
const STATUS_MAPPINGS: Record<string, { stage: PermitStage; state: PermitState }> = {
  // Application Submission - Initial Review
  SUBMITTED: {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.INITIAL_REVIEW
  },
  SUBMISSION_REVIEW: {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.INITIAL_REVIEW
  },

  // Technical Review - In Progress
  TECHNICAL_REVIEW: {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },
  REFERRAL: {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },
  FIRST_NATIONS_CONSULTATION: {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },
  TECH_REVIEW_COMPLETED: {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.IN_PROGRESS
  },

  // Pending Decision - In Progess
  DECISION_REVIEW: {
    stage: PermitStage.PENDING_DECISION,
    state: PermitState.IN_PROGRESS
  },

  // Post Decision
  // Approved
  ALLOWED: {
    stage: PermitStage.POST_DECISION,
    state: PermitState.APPROVED
  },
  OFFERED: {
    stage: PermitStage.POST_DECISION,
    state: PermitState.APPROVED
  },
  // Denied
  DISALLOWED: {
    stage: PermitStage.POST_DECISION,
    state: PermitState.DENIED
  },
  DECLINED: {
    stage: PermitStage.POST_DECISION,
    state: PermitState.DENIED
  },
  // Issued
  ISSUED: {
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

/**
 * Comparator for ordering PEACH process events
 * Events are ordered primarily by their event date/time (using {@link compareDates}),
 * and secondarily by the configured application process priority map
 * @param a First process event to compare
 * @param b Second process event to compare
 * @param desc If true, sorts in descending order (latest / highest ranked first)
 * @returns A negative number if a before b, positive if a after b, or 0 if equal
 */
export function compareProcessEvents(a: ProcessEvent, b: ProcessEvent, desc = false): number {
  const dateA = piesEventToDate(a.event);
  const dateB = piesEventToDate(b.event);

  const dateCmp = compareDates(dateA, dateB, desc);
  if (dateCmp !== 0) return dateCmp;

  const rankA = APPLICATION_PROCESS_ORDERING_MAP[a.process.code];
  const rankB = APPLICATION_PROCESS_ORDERING_MAP[b.process.code];

  return desc ? rankB - rankA : rankA - rankB;
}

/**
 * Gets the N-th process event and the M-th on-hold event from a PEACH record, using a consistent ordering.
 * On-hold events are currently sorted by date (latest first) only.
 * If n or m is out of range, the first element of the respective list is returned.
 * @param record PEACH record
 * @param n Optional index of the desired process event after sorting - default: 0, latest event
 * @param m Optional index of the desired on-hold event after sorting - default: 0, latest event
 * @returns An object containing the selected processEvent and onHoldEvent.
 */
export const getRecordEvents = (
  record: PeachRecord,
  n: number = 0,
  m: number = 0
): { processEvent: ProcessEvent; onHoldEvent: CodingEvent } => {
  const processEvents = [...record.process_event_set].sort((a, b) => compareProcessEvents(a, b, true));
  // TODO: Once onHold is implemented a tie breaker compartive function will be needed
  const onHoldEvents = [...record.on_hold_event_set].sort((a, b) =>
    compareDates(piesEventToDate(a.event), piesEventToDate(b.event), true)
  );

  const processEvent = processEvents.length > n ? processEvents[n] : processEvents[0];
  const onHoldEvent = onHoldEvents.length > m ? onHoldEvents[m] : onHoldEvents[0];

  return { processEvent, onHoldEvent };
};

/**
 * Derives the PCNS permit phase, stage, and state from a PEACH process event,
 * using the configured status mappings.
 * For terminal codes in {@link PeachTerminatedStage}, the previous stage code
 * is used together with the terminal code to look up the mapping
 * @param processEvent The primary PEACH process event to interpret.
 * @param record The full PEACH record, used to look up previous events when needed.
 * @returns An object containing phase, and optionally stage and state if a mapping exists.
 */
const generateStatus = (
  processEvent: ProcessEvent,
  record: PeachRecord
): { phase: PermitPhase; stage: PermitStage | undefined; state: PermitState | undefined } => {
  // Note: Placeholder for phase, still only one phase for permits in both PEACH and PCNS
  const phase = PermitPhase.APPLICATION;

  let statusKey = processEvent.process.code;

  if (statusKey in PeachTerminatedStage) {
    const { processEvent } = getRecordEvents(record, 1);
    const prevStageCode = processEvent.process.code_set[1] as string;
    statusKey = `${prevStageCode}:${statusKey}`;
  }

  const { stage, state } = STATUS_MAPPINGS[statusKey] ?? {};

  return {
    phase,
    stage,
    state
  };
};

/**
 * Normalizes a PIES event into a JavaScript Date
 * If start_datetime is present, it is used directly
 * Otherwise, start_date is treated as midnight UTC for that date
 * @param piesEvent PIES event object
 * @returns A Date instance representing the event start
 */
const piesEventToDate = (piesEvent: PiesEvent): Date => {
  const { start_date, start_datetime } = piesEvent;

  if (start_datetime) {
    return new Date(start_datetime);
  } else {
    // Asserting start_date because if a Pies event doesn't have start_datetime it will always have start_date
    const [year, month, day] = start_date!.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }
};

/**
 * Normalizes a PIES event into date and time strings
 * If start_datetime is present, it is used directly to split
 * Otherwise, returns start_date string and time as null
 * @param piesEvent PIES event object
 * @returns An object with two strings representing the event start date and time seperately
 */
export function piesEventToDateParts(piesEvent: PiesEvent): DateTimeStrings {
  const { start_date, start_datetime } = piesEvent;

  if (start_datetime) {
    const startDate = new Date(start_datetime);
    return splitDateTime(startDate);
  }
  return { date: start_date!, time: null };
}

/**
 * Finds the submitted date and/or time for an application from its PEACH record
 * @param record PEACH record to search
 * @returns A split date representing the submitted date and time, or both null if not found
 */
const findSubmittedDate = (record: PeachRecord): NullableDateTimeStrings => {
  for (const pe of record.process_event_set) {
    if (pe.process.code === PEACH_SUBMITTED_STATE) {
      return piesEventToDateParts(pe.event);
    }
  }
  return {
    date: null,
    time: null
  };
};

/**
 * Finds the decision date and/or time for an application from its PEACH record
 * @param record PEACH record to search
 * @returns A split date representing the decision date and time, or both null if not found
 */
const findDecisionDate = (record: PeachRecord): NullableDateTimeStrings => {
  for (const pe of record.process_event_set) {
    if (PEACH_DECISION_STATES.includes(pe.process.code)) {
      return piesEventToDateParts(pe.event);
    }
  }
  return {
    date: null,
    time: null
  };
};

/**
 * Produces a normalized {@link PeachSummary} for a single PEACH record
 * @param record Full PEACH record to summarize
 * @returns A peach summary containing the derived stage, state, and key dates, if no stage or state return null
 */
export function summarizeRecord(record: PeachRecord): PeachSummary | null {
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

  const { stage, state } = generateStatus(processEvent, record);

  if (!stage || !state) return null;

  const { date: statusLastChanged, time: statusLastChangedTime } = piesEventToDateParts(processEvent.event);
  const { date: submittedDate, time: submittedTime } = findSubmittedDate(record);
  const { date: decisionDate, time: decisionTime } = findDecisionDate(record);

  return {
    stage,
    state,
    submittedDate,
    submittedTime,
    decisionDate,
    decisionTime,
    statusLastChanged,
    statusLastChangedTime
  };
}

/**
 * Parses an array of PEACH records into a lookup map of summaries,
 * @param records Readonly list of PEACH records to parse.
 * @returns A map of peach summaries keyed by the system id and record id
 */
export function parsePeachRecords(records: readonly PeachRecord[]): Record<string, PeachSummary> {
  const parsedRecords: Record<string, PeachSummary> = {};
  for (const record of records) {
    const summary = summarizeRecord(record);
    if (!summary) continue;
    parsedRecords[record.system_id + record.record_id] = summary;
  }
  return parsedRecords;
}
