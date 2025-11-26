import {
  TEST_PEACH_RECORD_1,
  TEST_PEACH_RECORD_2,
  TEST_PEACH_RECORD_REJECTED,
  TEST_PEACH_RECORD_UNMAPPED,
  TEST_PEACH_RECORD_ISSUED
} from '../data';
import {
  compareProcessEvents,
  getRecordEvents,
  parsePeachRecords,
  summarizeRecord
} from '../../../src/parsers/peachParser';
import { PeachIntegratedSystem, PermitStage, PermitState } from '../../../src/utils/enums/permit';

import type { ProcessEvent, Record as PeachRecord } from '../../../src/types';

jest.mock('config');
jest.mock('../../../src/components/log', () => ({
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
  });

  describe('getRecordEvents', () => {
    it('returns the most recent process event when n = 0', () => {
      const record = TEST_PEACH_RECORD_REJECTED;

      const { processEvent } = getRecordEvents(record);

      expect(processEvent.process.code).toBe('REJECTED');
    });

    it('falls back to the first process event when n is out of range', () => {
      const record: PeachRecord = {
        ...TEST_PEACH_RECORD_1,
        process_event_set: [
          {
            event: { start_datetime: '2024-09-01T00:00:00.000Z' },
            process: {
              code: 'SUBMITTED',
              code_display: 'Submitted',
              code_set: ['APPLICATION', 'PRE_APPLICATION', 'SUBMITTED'],
              code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
            }
          }
        ]
      };

      const { processEvent } = getRecordEvents(record, 5);

      expect(processEvent.event.start_datetime).toBe('2024-09-01T00:00:00.000Z');
      expect(processEvent.process.code).toBe('SUBMITTED');
    });
  });

  describe('summarizeRecord', () => {
    it('maps PRE_APPLICATION/SUBMITTED to Application Submission / Initial review and sets sub/status dates', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_1);

      // From SUBMITTED event 2024-02-01T00:00:00.000Z
      expect(summary!.statusLastChanged).toBe('2024-02-01');
      expect(summary!.statusLastChangedTime).toBe(null);

      expect(summary!.submittedDate).toBe('2024-02-01');
      expect(summary!.submittedTime).toBe(null);

      expect(summary!.decisionDate).toBeNull();
      expect(summary!.decisionTime).toBeNull();

      expect(summary!.stage).toBe(PermitStage.APPLICATION_SUBMISSION);
      expect(summary!.state).toBe(PermitState.INITIAL_REVIEW);
    });

    it('maps DECISION/ALLOWED to Post Decision / Approved and sets decision/status dates', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_2);

      expect(summary!.statusLastChanged).toBe('2024-03-01');
      expect(summary!.statusLastChangedTime).toBe('12:00:00.000Z');

      expect(summary!.decisionDate).toBe('2024-03-01');
      expect(summary!.decisionTime).toBe('12:00:00.000Z');

      expect(summary!.submittedDate).toBeNull();
      expect(summary!.submittedTime).toBeNull();

      expect(summary!.stage).toBe(PermitStage.POST_DECISION);
      expect(summary!.state).toBe(PermitState.APPROVED);
    });

    it('uses previous stage for terminal REJECTED and maps to Technical review / Rejected', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_REJECTED);

      expect(summary!.statusLastChanged).toBe('2024-05-01');
      expect(summary!.statusLastChangedTime).toBe('23:12:00.000Z');

      expect(summary!.submittedDate).toBeNull();
      expect(summary!.submittedTime).toBeNull();
      expect(summary!.decisionDate).toBeNull();
      expect(summary!.decisionTime).toBeNull();

      expect(summary!.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary!.state).toBe(PermitState.REJECTED);
    });

    it('returns null summary for an unmapped PEACH combination', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_UNMAPPED);

      expect(summary).toBe(null);
    });

    it('uses start_date branch in piesEventToDate and ISSUANCE to determine decisionDate', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_ISSUED);

      // start_date only: '2024-07-01'
      expect(summary!.statusLastChanged).toBe('2024-07-01');
      expect(summary!.statusLastChangedTime).toBeNull();

      expect(summary!.decisionDate).toBe('2024-07-01');
      expect(summary!.decisionTime).toBeNull();

      expect(summary!.stage).toBe(PermitStage.POST_DECISION);
      expect(summary!.state).toBe(PermitState.ISSUED);

      expect(summary!.submittedDate).toBeNull();
      expect(summary!.submittedTime).toBeNull();
    });
  });

  describe('parsePeachRecords', () => {
    it('indexes by system_id + record_id and summarizes each record with mapped stage/state', () => {
      const map = parsePeachRecords([TEST_PEACH_RECORD_1, TEST_PEACH_RECORD_2]);

      const key1 = `${PeachIntegratedSystem.VFCBC}REC-SUB`;
      const key2 = `${PeachIntegratedSystem.VFCBC}REC-DECISION`;

      expect(Object.keys(map).sort()).toEqual([key1, key2].sort());

      const s1 = map[key1];
      expect(s1.statusLastChanged).toBe('2024-02-01');
      expect(s1.statusLastChangedTime).toBe(null);
      expect(s1.submittedDate).toBe('2024-02-01');
      expect(s1.submittedTime).toBe(null);
      expect(s1.decisionDate).toBeNull();
      expect(s1.decisionTime).toBeNull();
      expect(s1.stage).toBe(PermitStage.APPLICATION_SUBMISSION);
      expect(s1.state).toBe(PermitState.INITIAL_REVIEW);

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
      const map = parsePeachRecords([TEST_PEACH_RECORD_UNMAPPED, TEST_PEACH_RECORD_2]);

      const key1 = `${PeachIntegratedSystem.VFCBC}REC-UNMAPPED`;
      const key2 = `${PeachIntegratedSystem.VFCBC}REC-DECISION`;

      expect(Object.keys(map).sort()).toEqual([key2].sort());

      const s1 = map[key1];
      expect(s1).toBe(undefined);
    });

    it('returns an empty object when given an empty record list', () => {
      const map = parsePeachRecords([]);
      expect(map).toEqual({});
    });
  });
});
