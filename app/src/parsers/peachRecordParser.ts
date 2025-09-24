import { compareDates } from '../utils';

import type { Code, Coding, CodingEvent, PeachRecord, PiesEvent, Process, ProcessEvent } from '../types/peachPies';

// UNTESTED
const asCodes = <T extends readonly string[]>(...vals: T): readonly Code[] => vals as unknown as readonly Code[];

const codeSet = (c: Coding | Process): Code[] => [...c.code_set];

const mostRecentProcessEvent = (record: PeachRecord): ProcessEvent | undefined =>
  [...record.process_event_set].sort((a, b) => compareDates(toDate(a.event), toDate(b.event)))[0];

const mostRecentOnHoldEvent = (record: PeachRecord): CodingEvent | undefined =>
  [...record.on_hold_event_set].sort((a, b) => compareDates(toDate(a.event), toDate(b.event)))[0];

const getStageStateFromCodes = (codes: Code[]): { stage?: Code; state?: Code } => {
  const phase = codes[0];
  const stage = codes[1] ?? phase;
  const state = codes[2] ?? codes[1] ?? phase;
  return { stage, state };
};

const toDate = (e: PiesEvent): Date | undefined => {
  if ('start_datetime' in e && e.start_datetime) return new Date(e.start_datetime);
  if ('start_date' in e && e.start_date) return new Date(`${e.start_date}T00:00:00.000Z`);
  return undefined;
};

const equalsExact = (arr: Code[], exact: readonly Code[]) =>
  arr.length === exact.length && arr.every((c, i) => c === exact[i]);

const startsWith = (arr: Code[], prefix: readonly Code[]) => prefix.every((c, i) => arr[i] === c);

// Field finders
const findSubmittedDate = (rec: PeachRecord): Date | undefined => {
  for (const pe of rec.process_event_set) {
    const codes = codeSet(pe.process);
    if (equalsExact(codes, asCodes('APPLICATION', 'PRE_APPLICATION', 'SUBMITTED'))) {
      return toDate(pe.event);
    }
  }
  return undefined;
};

const findDecisionDate = (rec: PeachRecord): Date | undefined => {
  for (const pe of rec.process_event_set) {
    const codes = codeSet(pe.process);
    if (
      startsWith(codes, asCodes('APPLICATION', 'DECISION')) ||
      startsWith(codes, asCodes('APPLICATION', 'ISSUANCE')) ||
      equalsExact(codes, asCodes('APPLICATION', 'ISSUED'))
    ) {
      return toDate(pe.event);
    }
  }
  return undefined;
};

export type PeachSummary = {
  decisionDate?: Date;
  stage: Code | undefined;
  state: Code | undefined;
  statusChangeDate: Date | undefined;
  submittedDate?: Date;
};

export function summarizeRecord(record: PeachRecord): PeachSummary {
  const recentProcess = mostRecentProcessEvent(record);
  const recentOnHold = mostRecentOnHoldEvent(record);

  let stage: Code | undefined;
  let state: Code | undefined;
  let statusChangeDate: Date | undefined;

  if (recentProcess) {
    const codes = codeSet(recentProcess.process);
    ({ stage, state } = getStageStateFromCodes(codes));
    statusChangeDate = toDate(recentProcess.event);
  } else if (recentOnHold) {
    const codes = codeSet(recentOnHold.coding);
    ({ stage, state } = getStageStateFromCodes(codes));
    statusChangeDate = toDate(recentOnHold.event);
  }

  const submittedDate = findSubmittedDate(record);
  const decisionDate = findDecisionDate(record);

  return { stage, state, submittedDate, decisionDate, statusChangeDate };
}

export function parsePeachRecords(records: readonly PeachRecord[]): Record<string, PeachSummary> {
  const parsedRecords: Record<string, PeachSummary> = {};
  for (const record of records) parsedRecords[record.system_id + record.record_id] = summarizeRecord(record);
  return parsedRecords;
}

// TODO-PR Finish going though code and ensure correct things are happening.
