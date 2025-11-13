import {
  TEST_PEACH_RECORD_1,
  TEST_PEACH_RECORD_2,
  TEST_PEACH_RECORD_REJECTED,
  TEST_PEACH_RECORD_UNMAPPED,
  TEST_PEACH_RECORD_ISSUED
} from '../data';
import { summarizeRecord, parsePeachRecords } from '../../../src/parsers/peachParser';
import { PeachIntegratedSystem, PermitStage, PermitState } from '../../../src/utils/enums/permit';

jest.mock('config');
jest.mock('../../../src/components/log', () => ({
  getLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), log: jest.fn() })
}));

describe('peachRecordParser', () => {
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
