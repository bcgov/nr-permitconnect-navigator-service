import { compareDates, splitDateTime } from '../utils/index.ts';
import { PeachTerminatedStage, PermitPhase, PermitStage, PermitState } from '../utils/enums/permit.ts';

import type {
  CodingEvent,
  Record as PeachRecord,
  Event as PiesEvent,
  NullableDateTimeStrings,
  PeachSummary,
  ProcessEvent,
  DateTimeStrings
} from '../types/index.ts';

interface Status {
  phase: PermitPhase;
  stage: PermitStage | undefined;
  state: PermitState | undefined;
}

enum PeachOnHoldCode {
  MISSING_INFORMATION = 'MISSING_INFORMATION'
}

const PEACH_DECISION_STATES = new Set(['ALLOWED', 'DISALLOWED', 'OFFERED', 'ISSUED', 'DECLINED']);

const PEACH_SUBMITTED_STATE = 'SUBMITTED';

/**
 * Inferred process ordering from
 * @see {@link https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process}
 */
const APPLICATION_PROCESS_ORDERING: string[] = [
  'APPLICATION',
  'PRE_APPLICATION',
  'DRAFT',
  'SUBMITTED',
  'INITIAL_SUBMISSION_REVIEW',
  'SUBMISSION_REVIEW',
  'ACCEPTED',
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
 * Inferred process ordering mapping for quick ordering rank look up
 */
const APPLICATION_PROCESS_ORDERING_MAP: Record<string, number> = APPLICATION_PROCESS_ORDERING.reduce(
  (acc, code, index) => {
    acc[code] = index;
    return acc;
  },
  {} as Record<string, number>
);

/**
 * Mappings for PEACH coding codes to PCNS display value
 */
const CODING_STATUS_MAPPINGS: Record<string, { stage: PermitStage; state: PermitState }> = {
  // On hold mappings
  'MISSING_INFORMATION:PRE_APPLICATION': {
    stage: PermitStage.PRE_SUBMISSION,
    state: PermitState.PENDING_CLIENT
  },
  'MISSING_INFORMATION:INITIAL_SUBMISSION_REVIEW': {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.PENDING_CLIENT
  },
  'MISSING_INFORMATION:TECH_REVIEW_COMMENT': {
    stage: PermitStage.TECHNICAL_REVIEW,
    state: PermitState.PENDING_CLIENT
  },
  'MISSING_INFORMATION:DECISION': {
    stage: PermitStage.PENDING_DECISION,
    state: PermitState.PENDING_CLIENT
  },
  'MISSING_INFORMATION:ISSUANCE': {
    stage: PermitStage.POST_DECISION,
    state: PermitState.PENDING_CLIENT
  }
};

/**
 * Mappings for PEACH process codes to PCNS display values
 */
const PROCESS_STATUS_MAPPINGS: Record<string, { stage: PermitStage; state: PermitState }> = {
  // Application Submission - Initial Review
  SUBMITTED: {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.INITIAL_REVIEW
  },
  SUBMISSION_REVIEW: {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.INITIAL_REVIEW
  },

  // Application Submission - Accepted
  ACCEPTED: {
    stage: PermitStage.APPLICATION_SUBMISSION,
    state: PermitState.ACCEPTED
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

  // Pending Decision - In Progress
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
 * Finds the submitted date and/or time for an application from a list of process events
 * @param processEvents Process events to search
 * @returns A split date representing the submitted date and time, or both null if not found
 */
function findSubmittedDate(processEvents: ProcessEvent[]): NullableDateTimeStrings {
  for (const pe of processEvents) {
    if (pe.process.code === PEACH_SUBMITTED_STATE) {
      return piesEventToDateParts(pe.event);
    }
  }
  return {
    date: null,
    time: null
  };
}

/**
 * Finds the decision date and/or time for an application from a list of process events
 * @param processEvents Process events to search
 * @returns A split date representing the decision date and time, or both null if not found
 */
function findDecisionDate(processEvents: ProcessEvent[]): NullableDateTimeStrings {
  for (const pe of processEvents) {
    if (PEACH_DECISION_STATES.has(pe.process.code)) {
      return piesEventToDateParts(pe.event);
    }
  }
  return {
    date: null,
    time: null
  };
}

/**
 * Derives the PCNS permit phase, stage, and state from a PEACH coding event and a PEACH
 * process event, using the configured status mappings.
 * For on hold codes in {@link PeachOnHoldCode}, the current stage code
 * is used together with the terminal code to look up the mapping
 * @param codingEvent The coding event used to generate the status.
 * @param processEvent Optional latest process event to be used to get current status info.
 * @returns An object containing phase, and optionally stage and state if a mapping exists.
 */
function generateCodingStatus(codingEvent: CodingEvent, processEvent?: ProcessEvent): Status {
  // Note: Placeholder for phase, still only one phase for permits in both PEACH and PCNS
  const phase = PermitPhase.APPLICATION;

  let codeKey = codingEvent.coding.code;

  // Handle PEACH on hold codings
  if (codeKey in PeachOnHoldCode) {
    if (!processEvent) {
      return { phase, stage: undefined, state: undefined };
    }
    const stageCode = processEvent.process.code_set[1];
    codeKey = `${codeKey}:${stageCode}`;
  }

  const { stage, state } = CODING_STATUS_MAPPINGS[codeKey] ?? {};

  return {
    phase,
    stage,
    state
  };
}

/**
 * Derives the PCNS permit phase, stage, and state from a given PEACH process event and the previous
 * process event, using the configured status mappings.
 * For terminal codes in {@link PeachTerminatedStage}, the previous stage code
 * is used together with the terminal code to look up the mapping
 * @param processEvent Process event used to generate the status.
 * @param prevProcessEvent Optional previous process event used to lookup previous process stage if needed.
 * @returns An object containing phase, and optionally stage and state if a mapping exists.
 */
function generateProcessStatus(processEvent: ProcessEvent, prevProcessEvent?: ProcessEvent): Status {
  // Note: Placeholder for phase, still only one phase for permits in both PEACH and PCNS
  const phase = PermitPhase.APPLICATION;

  let statusKey = processEvent.process.code;

  if (statusKey in PeachTerminatedStage) {
    if (!prevProcessEvent) {
      return { phase, stage: undefined, state: undefined };
    }
    const prevStageCode = prevProcessEvent.process.code_set[1];
    statusKey = `${prevStageCode}:${statusKey}`;
  }

  const { stage, state } = PROCESS_STATUS_MAPPINGS[statusKey] ?? {};

  return {
    phase,
    stage,
    state
  };
}

/**
 * Normalizes a PIES event into a JavaScript Date
 * If start_datetime is present, it is used directly
 * Otherwise, start_date is treated as midnight UTC for that date
 * @param piesEvent PIES event object
 * @returns A Date instance representing the event start
 */
function piesEventStartToDate(piesEvent: PiesEvent): Date {
  const { start_date, start_datetime } = piesEvent;

  if (start_datetime) {
    return new Date(start_datetime);
  } else {
    // Asserting start_date as defined; A Pies event will have start_date if start_datetime is not present
    const [year, month, day] = start_date!.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }
}

/**
 * Normalizes a PIES event into date and time strings
 * If start_datetime is present, it is used directly to split
 * Otherwise, returns start_date string and time as null
 * @param piesEvent PIES event object
 * @returns An object with two strings representing the event start date and time seperately
 */
function piesEventToDateParts(piesEvent: PiesEvent): DateTimeStrings {
  const { start_date, start_datetime } = piesEvent;

  if (start_datetime) {
    const startDate = new Date(start_datetime);
    return splitDateTime(startDate);
  }
  return { date: start_date!, time: null };
}

/**
 * Sorts (in place) the given record's event sets into descending order
 * @param record PEACH record to have its event sets sorted
 */
function sortRecordEvents(record: PeachRecord) {
  if (record.process_event_set) {
    record.process_event_set.sort((a, b) => compareProcessEvents(a, b, true));
  }

  if (record.on_hold_event_set) {
    record.on_hold_event_set.sort((a, b) =>
      compareDates(piesEventStartToDate(a.event), piesEventStartToDate(b.event), true)
    );
  }
}

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
  const dateA = piesEventStartToDate(a.event);
  const dateB = piesEventStartToDate(b.event);

  const dateCmp = compareDates(dateA, dateB, desc);
  if (dateCmp !== 0) return dateCmp;

  // Ensure unknown process codes are sorted correctly
  const aIsUnknown = !(a.process.code in APPLICATION_PROCESS_ORDERING_MAP);
  const bIsUnknown = !(b.process.code in APPLICATION_PROCESS_ORDERING_MAP);

  if (aIsUnknown && !bIsUnknown) return 1;
  if (!aIsUnknown && bIsUnknown) return -1;
  if (aIsUnknown && bIsUnknown) return 0;

  const rankA = APPLICATION_PROCESS_ORDERING_MAP[a.process.code];
  const rankB = APPLICATION_PROCESS_ORDERING_MAP[b.process.code];

  return desc ? rankB - rankA : rankA - rankB;
}

/**
 * Produces a normalized {@link PeachSummary} for a single PEACH record
 * @param record Full PEACH record to summarize
 * @returns A peach summary containing the derived stage, state, and key dates, if no stage or state return null
 */
export function summarizePeachRecord(record: PeachRecord): PeachSummary | null {
  // Sort the record's events - latest to earliest
  sortRecordEvents(record);

  const processEvents = record.process_event_set;
  const onHoldEvents = record.on_hold_event_set;

  if (!processEvents && !onHoldEvents) return null;

  let stage: PermitStage | undefined;
  let state: PermitState | undefined;
  let statusEvent: PiesEvent;

  const latestProcessEvent = processEvents?.[0];
  const latestOnHoldEvent = onHoldEvents?.[0];
  const isActiveOnHoldEvent = !latestOnHoldEvent?.event.end_date && !latestOnHoldEvent?.event.end_datetime;
  const onHoldStartDate = latestOnHoldEvent ? piesEventStartToDate(latestOnHoldEvent.event) : undefined;
  const processStartDate = latestProcessEvent ? piesEventStartToDate(latestProcessEvent.event) : undefined;
  const useOnHoldEvent = isActiveOnHoldEvent && compareDates(onHoldStartDate, processStartDate) >= 0;

  // Note: missingInfoOnHoldEvent will need to be changed/removed once we start handling all/more on hold codes
  const isMissingInfoOnHoldEvent = latestOnHoldEvent?.coding.code === PeachOnHoldCode.MISSING_INFORMATION;

  if (latestOnHoldEvent && useOnHoldEvent && isMissingInfoOnHoldEvent) {
    ({ stage, state } = generateCodingStatus(latestOnHoldEvent, latestProcessEvent));
    statusEvent = latestOnHoldEvent.event;
  } else if (latestProcessEvent) {
    ({ stage, state } = generateProcessStatus(latestProcessEvent, processEvents[1]));
    statusEvent = latestProcessEvent.event;
  } else {
    return null;
  }

  if (!stage || !state) return null;

  const { date: statusLastChanged, time: statusLastChangedTime } = piesEventToDateParts(statusEvent);
  const { date: submittedDate, time: submittedTime } = findSubmittedDate(processEvents!);
  const { date: decisionDate, time: decisionTime } = findDecisionDate(processEvents!);

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
    const summary = summarizePeachRecord(record);
    if (!summary) continue;
    parsedRecords[record.system_id + record.record_id] = summary;
  }
  return parsedRecords;
}
