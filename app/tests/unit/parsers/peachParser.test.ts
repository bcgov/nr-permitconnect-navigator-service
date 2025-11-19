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

      expect(summary.statusLastChanged?.toISOString()).toBe('2024-02-01T00:00:00.000Z');
      expect(summary.submittedDate?.toISOString()).toBe('2024-02-01T00:00:00.000Z');
      expect(summary.adjudicationDate).toBeUndefined();
      expect(summary.stage).toBe(PermitStage.APPLICATION_SUBMISSION);
      expect(summary.state).toBe(PermitState.INITIAL_REVIEW);
    });

    it('maps DECISION/ALLOWED to Post Decision / Approved and sets adjudication/status dates', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_2);

      expect(summary.statusLastChanged?.toISOString()).toBe('2024-03-01T12:00:00.000Z');
      expect(summary.adjudicationDate?.toISOString()).toBe('2024-03-01T12:00:00.000Z');
      expect(summary.submittedDate).toBeUndefined();
      expect(summary.stage).toBe(PermitStage.POST_DECISION);
      expect(summary.state).toBe(PermitState.APPROVED);
    });

    it('uses previous stage for terminal REJECTED and maps to Technical review / Rejected', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_REJECTED);

      expect(summary.statusLastChanged?.toISOString()).toBe('2024-05-01T00:00:00.000Z');
      expect(summary.stage).toBe(PermitStage.TECHNICAL_REVIEW);
      expect(summary.state).toBe(PermitState.REJECTED);
      expect(summary.submittedDate).toBeUndefined();
      expect(summary.adjudicationDate).toBeUndefined();
    });

    it('returns undefined stage/state for an unmapped PEACH combination but still sets status date', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_UNMAPPED);

      expect(summary.statusLastChanged?.toISOString()).toBe('2024-06-01T00:00:00.000Z');
      expect(summary.stage).toBeUndefined();
      expect(summary.state).toBeUndefined();
      expect(summary.submittedDate).toBeUndefined();
      expect(summary.adjudicationDate).toBeUndefined();
    });

    it('uses start_date branch in piesEventToDate and ISSUANCE to determine adjudicationDate', () => {
      const summary = summarizeRecord(TEST_PEACH_RECORD_ISSUED);

      expect(summary.statusLastChanged?.toISOString()).toBe('2024-07-01T00:00:00.000Z');
      expect(summary.adjudicationDate?.toISOString()).toBe('2024-07-01T00:00:00.000Z');
      expect(summary.stage).toBe(PermitStage.POST_DECISION);
      expect(summary.state).toBe(PermitState.ISSUED);
      expect(summary.submittedDate).toBeUndefined();
    });

    it('uses the fallback (first event) when requesting a previous event but only one process event exists', () => {
      const record = {
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
      } as PeachRecord;

      const summary = summarizeRecord(record);

      expect(summary.statusLastChanged?.toISOString()).toBe('2024-09-01T00:00:00.000Z');

      expect(summary.stage).toBe(PermitStage.APPLICATION_SUBMISSION);
      expect(summary.state).toBe(PermitState.INITIAL_REVIEW);
    });
  });

  describe('parsePeachRecords', () => {
    it('indexes by system_id + record_id and summarizes each record with mapped stage/state', () => {
      const map = parsePeachRecords([TEST_PEACH_RECORD_1, TEST_PEACH_RECORD_2]);

      const key1 = `${PeachIntegratedSystem.VFCBC}REC-SUB`;
      const key2 = `${PeachIntegratedSystem.VFCBC}REC-DECISION`;

      expect(Object.keys(map).sort()).toEqual([key1, key2].sort());

      expect(map[key1].statusLastChanged?.toISOString()).toBe('2024-02-01T00:00:00.000Z');
      expect(map[key1].submittedDate?.toISOString()).toBe('2024-02-01T00:00:00.000Z');
      expect(map[key1].adjudicationDate).toBeUndefined();
      expect(map[key1].stage).toBe(PermitStage.APPLICATION_SUBMISSION);
      expect(map[key1].state).toBe(PermitState.INITIAL_REVIEW);

      expect(map[key2].statusLastChanged?.toISOString()).toBe('2024-03-01T12:00:00.000Z');
      expect(map[key2].adjudicationDate?.toISOString()).toBe('2024-03-01T12:00:00.000Z');
      expect(map[key2].submittedDate).toBeUndefined();
      expect(map[key2].stage).toBe(PermitStage.POST_DECISION);
      expect(map[key2].state).toBe(PermitState.APPROVED);
    });

    it('returns an empty object when given an empty record list', () => {
      const map = parsePeachRecords([]);
      expect(map).toEqual({});
    });
  });
});
