import {
  TEST_PEACH_ON_HOLD_EVENT_1,
  TEST_PEACH_ON_HOLD_EVENT_2,
  TEST_PEACH_RECORD_1,
  TEST_PEACH_RECORD_2,
  TEST_PEACH_RECORD_REJECTED,
  TEST_PEACH_RECORD_UNMAPPED
} from '../data/index.ts';
import { compareProcessEvents, parsePeachRecords, summarizePeachRecord } from '../../../src/parsers/peach.ts';
import { PeachIntegratedSystem, PermitStage, PermitState } from '../../../src/utils/enums/permit.ts';

import type { ProcessEvent } from '../../../src/types/index.ts';

jest.mock('config');
jest.mock('../../../src/utils/log', () => ({
  getLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), verbose: jest.fn(), log: jest.fn() })
}));

describe('peachRecordParser', () => {
  describe('compareProcessEvents', () => {
    it('supports both ascending and descending ordering and uses priority to break ties', () => {
      const eventEarly: ProcessEvent = {
        event: { start_datetime: '2024-01-01T00:00:00.000Z' },
        process: {
          code: 'PRE_APPLICATION',
          code_display: 'Pre-Application',
          code_set: ['APPLICATION', 'PRE_APPLICATION'],
          code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
        }
      };

      const eventLate: ProcessEvent = {
        event: { start_datetime: '2024-01-01T00:00:00.000Z' },
        process: {
          code: 'SUBMITTED',
          code_display: 'Submitted',
          code_set: ['APPLICATION', 'PRE_APPLICATION', 'SUBMITTED'],
          code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
        }
      };

      const asc = compareProcessEvents(eventEarly, eventLate);
      expect(asc).toBeLessThan(0);

      const desc = compareProcessEvents(eventEarly, eventLate, true);
      expect(desc).toBeGreaterThan(0);
    });

    it('handles unknown codes by sorting them to the end', () => {
      const knownEvent: ProcessEvent = {
        event: { start_datetime: '2024-01-01T00:00:00.000Z' },
        process: {
          code: 'SUBMITTED',
          code_display: '',
          code_set: ['APPLICATION', 'PRE_APPLICATION', 'SUBMITTED'],
          code_system: ''
        }
      };
      const unknownEvent1: ProcessEvent = {
        event: { start_datetime: '2024-01-01T00:00:00.000Z' },
        process: {
          code: 'UNKNOWN_A',
          code_display: '',
          code_set: ['APPLICATION', 'PRE_APPLICATION', 'UNKNOWN_A'],
          code_system: ''
        }
      };
      const unknownEvent2: ProcessEvent = {
        event: { start_datetime: '2024-01-01T00:00:00.000Z' },
        process: {
          code: 'UNKNOWN_B',
          code_display: '',
          code_set: ['APPLICATION', 'PRE_APPLICATION', 'UNKNOWN_B'],
          code_system: ''
        }
      };

      expect(compareProcessEvents(unknownEvent1, knownEvent)).toBe(1);
      expect(compareProcessEvents(knownEvent, unknownEvent1)).toBe(-1);
      expect(compareProcessEvents(unknownEvent1, unknownEvent2)).toBe(0);
    });
  });

  describe('summarizePeachRecord', () => {
    it('maps TECH_REVIEW_COMMENT/REFERRAL to Technical review/In progess and sets sub/status dates', () => {
      const peachRecord = structuredClone(TEST_PEACH_RECORD_1);
      const summary = summarizePeachRecord(peachRecord)!;

      expect(summary.statusLastChanged).toBe('2024-02-01');
      expect(summary.statusLastChangedTime).toBe(null);

      expect(summary.submittedDate).toBe('2024-01-29');
      expect(summary.submittedTime).toBe(null);

      expect(summary.decisionDate).toBeNull();
      expect(summary.decisionTime).toBeNull();

      expect(summary.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary.state).toBe(PermitState.IN_PROGRESS);
    });

    it('maps DECISION/ALLOWED to Post Decision/Approved and sets decision/status dates', () => {
      const peachRecord = structuredClone(TEST_PEACH_RECORD_2);
      const summary = summarizePeachRecord(peachRecord)!;

      expect(summary.statusLastChanged).toBe('2024-03-01');
      expect(summary.statusLastChangedTime).toBe('12:00:00.000Z');

      expect(summary.decisionDate).toBe('2024-03-01');
      expect(summary.decisionTime).toBe('12:00:00.000Z');

      expect(summary.submittedDate).toBeNull();
      expect(summary.submittedTime).toBeNull();

      expect(summary.stage).toBe(PermitStage.POST_DECISION);
      expect(summary.state).toBe(PermitState.APPROVED);
    });

    it('uses previous stage for terminal REJECTED and maps to Technical review/Rejected', () => {
      const peachRecord = structuredClone(TEST_PEACH_RECORD_REJECTED);
      const summary = summarizePeachRecord(peachRecord)!;

      expect(summary.statusLastChanged).toBe('2024-05-01');
      expect(summary.statusLastChangedTime).toBe('23:12:00.000Z');

      expect(summary.submittedDate).toBeNull();
      expect(summary.submittedTime).toBeNull();
      expect(summary.decisionDate).toBeNull();
      expect(summary.decisionTime).toBeNull();

      expect(summary.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary.state).toBe(PermitState.REJECTED);
    });

    it('returns null summary for an unmapped PEACH combination', () => {
      const peachRecord = structuredClone(TEST_PEACH_RECORD_UNMAPPED);
      const summary = summarizePeachRecord(peachRecord);

      expect(summary).toBe(null);
    });

    it('returns null when both event sets are undefined or empty', () => {
      const recordUndefined = structuredClone(TEST_PEACH_RECORD_1);
      delete recordUndefined.process_event_set;
      delete recordUndefined.on_hold_event_set;
      expect(summarizePeachRecord(recordUndefined)).toBeNull();

      const recordEmpty = structuredClone(TEST_PEACH_RECORD_1);
      recordEmpty.process_event_set = [];
      recordEmpty.on_hold_event_set = [];
      expect(summarizePeachRecord(recordEmpty)).toBeNull();
    });

    it('returns null for a terminal stage missing a previous event', () => {
      const record = structuredClone(TEST_PEACH_RECORD_REJECTED);
      record.process_event_set = [record.process_event_set![1]];

      expect(summarizePeachRecord(record)).toBeNull();
    });

    it('process event sets status when there is no active on hold events (with end date/time)', () => {
      const record = structuredClone(TEST_PEACH_RECORD_1);
      const endedOnHoldEventDate = {
        ...TEST_PEACH_ON_HOLD_EVENT_1,
        event: { start_date: '2024-02-15', end_date: '2024-02-19' }
      };
      record.on_hold_event_set = [endedOnHoldEventDate];

      const summary1 = summarizePeachRecord(record)!;

      expect(summary1.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary1.state).toBe(PermitState.IN_PROGRESS);

      const endedOnHoldEventDateTime = {
        ...TEST_PEACH_ON_HOLD_EVENT_1,
        event: { start_datetime: '2024-01-15T00:00:00.000Z', end_datetime: '2024-02-19T00:00:00.000Z' }
      };
      record.on_hold_event_set = [endedOnHoldEventDateTime];

      const summary2 = summarizePeachRecord(record)!;

      expect(summary2.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary2.state).toBe(PermitState.IN_PROGRESS);
    });

    it('process event sets status when it is newer than the latest active on-hold event', () => {
      const record = structuredClone(TEST_PEACH_RECORD_1);
      const oldOnHoldEvent = { ...TEST_PEACH_ON_HOLD_EVENT_1, event: { start_date: '2024-01-15' } };
      record.on_hold_event_set = [oldOnHoldEvent];

      const summary = summarizePeachRecord(record)!;

      expect(summary.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary.state).toBe(PermitState.IN_PROGRESS);
    });

    it('on hold event sets status when it is newer than the latest process event and active', () => {
      const record = structuredClone(TEST_PEACH_RECORD_1);
      record.on_hold_event_set = [TEST_PEACH_ON_HOLD_EVENT_1];

      const summary = summarizePeachRecord(record)!;

      expect(summary.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary.state).toBe(PermitState.PENDING_CLIENT);
      expect(summary.statusLastChanged).toBe('2024-02-15');
    });

    it('returns null if there is an on-hold event but no process events', () => {
      const record = structuredClone(TEST_PEACH_RECORD_1);
      record.process_event_set = undefined;
      record.on_hold_event_set = [TEST_PEACH_ON_HOLD_EVENT_1];

      expect(summarizePeachRecord(record)).toBeNull();
    });

    it('returns null if an active MISSING_INFORMATION event is tied to an unmapped process stage', () => {
      const record = structuredClone(TEST_PEACH_RECORD_UNMAPPED);
      record.on_hold_event_set = [TEST_PEACH_ON_HOLD_EVENT_1];

      expect(summarizePeachRecord(record)).toBeNull();
    });

    // Note: This test will need to be changed/removed once we start handling all/more on hold codes
    it('process event sets status when only active on hold event code is not MISSING INFORMATION', () => {
      const record = structuredClone(TEST_PEACH_RECORD_1);
      const onHoldEventMissingNotActive = {
        ...TEST_PEACH_ON_HOLD_EVENT_1,
        event: { start_date: '2024-01-15', end_date: '2024-02-19' }
      };
      record.on_hold_event_set = [onHoldEventMissingNotActive, TEST_PEACH_ON_HOLD_EVENT_2];

      const summary = summarizePeachRecord(record)!;

      expect(summary.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary.state).toBe(PermitState.IN_PROGRESS);
    });
  });

  describe('parsePeachRecords', () => {
    it('indexes by system_id + record_id and summarizes each record with mapped stage/state', () => {
      const peachRecord1 = structuredClone(TEST_PEACH_RECORD_1);
      const peachRecord2 = structuredClone(TEST_PEACH_RECORD_2);
      const map = parsePeachRecords([peachRecord1, peachRecord2]);

      const key1 = `${PeachIntegratedSystem.VFCBC}${peachRecord1.record_id}`;
      const key2 = `${PeachIntegratedSystem.VFCBC}${peachRecord2.record_id}`;

      expect(Object.keys(map)).toHaveLength(2);
      expect(Object.keys(map)).toEqual(expect.arrayContaining([key1, key2]));

      const s1 = map[key1];
      expect(s1.statusLastChanged).toBe('2024-02-01');
      expect(s1.statusLastChangedTime).toBe(null);
      expect(s1.submittedDate).toBe('2024-01-29');
      expect(s1.submittedTime).toBe(null);
      expect(s1.decisionDate).toBeNull();
      expect(s1.decisionTime).toBeNull();
      expect(s1.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(s1.state).toBe(PermitState.IN_PROGRESS);

      const s2 = map[key2];
      expect(s2.statusLastChanged).toBe('2024-03-01');
      expect(s2.statusLastChangedTime).toBe('12:00:00.000Z');
      expect(s2.decisionDate).toBe('2024-03-01');
      expect(s2.decisionTime).toBe('12:00:00.000Z');
      expect(s2.submittedDate).toBeNull();
      expect(s2.submittedTime).toBeNull();
      expect(s2.stage).toBe(PermitStage.POST_DECISION);
      expect(s2.state).toBe(PermitState.APPROVED);
    });

    it('returns only the records that have mapped statuses', () => {
      const peachRecordUnmapped = structuredClone(TEST_PEACH_RECORD_UNMAPPED);
      const peachRecord = structuredClone(TEST_PEACH_RECORD_2);
      const map = parsePeachRecords([peachRecordUnmapped, peachRecord]);

      const key = `${PeachIntegratedSystem.VFCBC}${peachRecord.record_id}`;

      expect(Object.keys(map)).toHaveLength(1);
      expect(Object.keys(map)).toEqual(expect.arrayContaining([key]));

      const keyUnmapped = `${PeachIntegratedSystem.VFCBC}${peachRecordUnmapped.record_id}`;
      const s1 = map[keyUnmapped];

      expect(s1).toBe(undefined);
    });

    it('returns an empty object when given an empty record list', () => {
      const map = parsePeachRecords([]);
      expect(map).toEqual({});
    });
  });
});
