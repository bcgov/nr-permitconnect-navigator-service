import { mockReset } from 'vitest-mock-extended';

import {
  TEST_PEACH_RECORD_1,
  TEST_PEACH_RECORD_2,
  TEST_PEACH_SUMMARY,
  TEST_PERMIT_1,
  TEST_PERMIT_2
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { PermitStage, PermitState, PiesOnHold } from '#src/db/codes/enums';
import {
  applyPeachUpdates,
  fetchPeachRecords,
  findPriorityPermitTracking,
  getPeachTrackingRecords
} from '#src/domains/peach';
import * as permitDomain from '#src/domains/permit';
import * as peachExternal from '#src/external/peach';
import * as peachParser from '#src/parsers/peach';
import { PeachIntegratedSystem } from '#src/utils/enums/permit';

import type { Permit } from '#types';

// Gives a permit a single integrated tracking record for the given system
const withTracking = (permit: Permit, trackingId: string, sourceSystem: PeachIntegratedSystem) => ({
  ...permit,
  permitTracking: [
    {
      ...permit.permitTracking![0],
      trackingId,
      sourceSystemKind: { ...permit.permitTracking![0].sourceSystemKind, sourceSystem, integrated: true }
    }
  ]
});

vi.mock('../../../src/domains/permit.ts');
vi.mock('../../../src/external/peach.ts');
vi.mock('../../../src/parsers/peach.ts');
vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn(() => 'test-value'),
      has: vi.fn(() => false)
    }
  };
});

describe('peach domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('findPriorityPermitTracking', () => {
    it('should return undefined when permitTrackings is undefined', () => {
      const result = findPriorityPermitTracking(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined when permitTrackings is empty', () => {
      const result = findPriorityPermitTracking([]);
      expect(result).toBeUndefined();
    });

    it('should return tracking with highest priority - TANTALIS', () => {
      const tantalisTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.TANTALIS,
          integrated: true
        }
      };

      const wmaTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        permitTrackingId: 999,
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.WMA,
          integrated: true
        }
      };

      const result = findPriorityPermitTracking([wmaTracking, tantalisTracking] as never);

      expect(result).toEqual(tantalisTracking);
    });

    it('should return tracking with highest priority - WMA over VFCBC', () => {
      const wmaTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.WMA,
          integrated: true
        }
      };

      const vfcbcTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        permitTrackingId: 999,
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.VFCBC,
          integrated: true
        }
      };

      const result = findPriorityPermitTracking([vfcbcTracking, wmaTracking] as never);

      expect(result).toEqual(wmaTracking);
    });

    it('should skip non-integrated trackings', () => {
      const integratedTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.VFCBC,
          integrated: true
        }
      };

      const nonIntegratedTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        permitTrackingId: 999,
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          integrated: false
        }
      };

      const result = findPriorityPermitTracking([nonIntegratedTracking, integratedTracking] as never);

      expect(result).toEqual(integratedTracking);
    });

    it('should skip unknown source systems', () => {
      const validTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.VFCBC,
          integrated: true
        }
      };

      const unknownTracking = {
        ...TEST_PERMIT_1.permitTracking![0],
        permitTrackingId: 999,
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: 'UNKNOWN_SYSTEM',
          integrated: true
        }
      };

      const result = findPriorityPermitTracking([unknownTracking, validTracking] as never);

      expect(result).toEqual(validTracking);
    });

    it('should skip lower priority trackings when a higher priority one is already found', () => {
      const permitTrackings = [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          sourceSystemKind: {
            ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
            sourceSystem: PeachIntegratedSystem.TANTALIS,
            integrated: true
          }
        },

        {
          ...TEST_PERMIT_1.permitTracking![0],
          permitTrackingId: 999,
          sourceSystemKind: {
            ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
            sourceSystem: PeachIntegratedSystem.ATS,
            integrated: true
          }
        }
      ];

      const result = findPriorityPermitTracking(permitTrackings as never);

      expect(result?.sourceSystemKind?.sourceSystem).toBe(PeachIntegratedSystem.TANTALIS);
    });

    it('should return last VFCBC when both have same priority', () => {
      const vfcbc1 = {
        ...TEST_PERMIT_1.permitTracking![0],
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.VFCBC,
          integrated: true
        }
      };

      const vfcbc2 = {
        ...TEST_PERMIT_1.permitTracking![0],
        permitTrackingId: 999,
        sourceSystemKind: {
          ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
          sourceSystem: PeachIntegratedSystem.VFCBC,
          integrated: true
        }
      };

      const result = findPriorityPermitTracking([vfcbc1, vfcbc2] as never);

      expect(result).toEqual(vfcbc2);
    });
  });

  describe('getPeachTrackingRecords', () => {
    it('should return empty array when no PEACH integrated permits found', async () => {
      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([]);

      expect(await getPeachTrackingRecords(mockRepos)).toEqual([]);
    });

    it('should skip permits without permit tracking', async () => {
      const permit = { ...TEST_PERMIT_1, permitTracking: undefined };
      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);

      expect(await getPeachTrackingRecords(mockRepos)).toEqual([]);
    });

    it('should skip permits without priority tracking', async () => {
      const permit = { ...TEST_PERMIT_1, permitTracking: [] };
      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);

      expect(await getPeachTrackingRecords(mockRepos)).toEqual([]);
    });

    it('should return the priority tracking record id and system for each permit', async () => {
      const permit = withTracking(TEST_PERMIT_1, 'REC-1', PeachIntegratedSystem.VFCBC);
      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);

      expect(await getPeachTrackingRecords(mockRepos)).toEqual([
        { recordId: 'REC-1', systemId: PeachIntegratedSystem.VFCBC, permit }
      ]);
    });
  });

  describe('fetchPeachRecords', () => {
    it('should fetch and parse PEACH records with rate limiting', async () => {
      const permit = withTracking(TEST_PERMIT_2, 'REC-SUB', PeachIntegratedSystem.VFCBC);
      const parsedRecords = { [PeachIntegratedSystem.VFCBC + 'REC-SUB']: TEST_PEACH_SUMMARY };

      vi.spyOn(peachExternal, 'getPiesRecord').mockResolvedValue(TEST_PEACH_RECORD_1 as never);
      vi.spyOn(peachParser, 'parsePiesRecords').mockReturnValue(parsedRecords as never);

      const result = await fetchPeachRecords([
        { recordId: 'REC-SUB', systemId: PeachIntegratedSystem.VFCBC, permit: permit as never }
      ]);

      expect(peachExternal.getPiesRecord).toHaveBeenCalledWith('REC-SUB', PeachIntegratedSystem.VFCBC);
      expect(peachParser.parsePiesRecords).toHaveBeenCalledWith([TEST_PEACH_RECORD_1]);
      expect(result).toEqual(parsedRecords);
    });

    it('should handle PEACH fetch errors gracefully', async () => {
      vi.spyOn(peachExternal, 'getPiesRecord').mockRejectedValue(new Error('PEACH fetch failed'));
      vi.spyOn(peachParser, 'parsePiesRecords').mockReturnValue({});

      const result = await fetchPeachRecords([
        { recordId: 'REC-SUB', systemId: PeachIntegratedSystem.VFCBC, permit: TEST_PERMIT_2 as never }
      ]);

      expect(peachParser.parsePiesRecords).toHaveBeenCalledWith([]);
      expect(result).toEqual({});
    });

    it('should fetch every record', async () => {
      const getPiesRecordSpy = vi.spyOn(peachExternal, 'getPiesRecord');
      getPiesRecordSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1 as never);
      getPiesRecordSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_2 as never);
      vi.spyOn(peachParser, 'parsePiesRecords').mockReturnValue({});

      await fetchPeachRecords([
        { recordId: 'REC-1', systemId: PeachIntegratedSystem.VFCBC, permit: TEST_PERMIT_1 as never },
        { recordId: 'REC-2', systemId: PeachIntegratedSystem.WMA, permit: TEST_PERMIT_2 as never }
      ]);

      expect(getPiesRecordSpy).toHaveBeenCalledTimes(2);
      expect(peachParser.parsePiesRecords).toHaveBeenCalledWith([TEST_PEACH_RECORD_1, TEST_PEACH_RECORD_2]);
    });
  });

  describe('applyPeachUpdates', () => {
    const trackingRecordFor = (permit: Permit) => ({
      recordId: 'REC-SUB',
      systemId: PeachIntegratedSystem.VFCBC,
      permit
    });
    const key = PeachIntegratedSystem.VFCBC + 'REC-SUB';

    it('should skip permits with no parsed summary', async () => {
      const result = await applyPeachUpdates(mockRepos, [trackingRecordFor({ ...TEST_PERMIT_2 } as never)], {});

      expect(mockRepos.permit.upsert).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should update permit when stage differs', async () => {
      const permit = { ...TEST_PERMIT_1, stage: PermitStage.PRE_SUBMISSION, state: PermitState.NONE };
      const peachSummary = {
        ...TEST_PEACH_SUMMARY,
        stage: PermitStage.APPLICATION_SUBMISSION,
        submittedDate: null,
        decisionDate: null,
        statusLastChanged: null
      };
      const updatedPermit = { ...permit, stage: PermitStage.APPLICATION_SUBMISSION };
      mockRepos.permit.upsert.mockResolvedValue(updatedPermit as never);

      const result = await applyPeachUpdates(mockRepos, [trackingRecordFor(permit as never)], {
        [key]: peachSummary
      } as never);

      expect(mockRepos.permit.upsert).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].permit).toBe(updatedPermit);
    });

    it('should return updated permit when applicant requests hold', async () => {
      const permit = { ...TEST_PERMIT_2, onHoldCode: null };
      const peachSummary = {
        ...TEST_PEACH_SUMMARY,
        onHoldCode: PiesOnHold.APPLICANT_REQUEST,
        submittedDate: permit.submittedDate,
        decisionDate: permit.decisionDate,
        statusLastChanged: permit.statusLastChanged,
        stage: permit.stage,
        state: permit.state
      };
      mockRepos.permit.upsert.mockResolvedValue({ ...permit, onHoldCode: PiesOnHold.APPLICANT_REQUEST } as never);

      const result = await applyPeachUpdates(mockRepos, [trackingRecordFor(permit as never)], {
        [key]: peachSummary
      } as never);

      expect(result).toHaveLength(1);
      expect(result[0].note).toMatch(/This application has been placed on hold at the applicant.*request/);
    });

    it('should only return permits with status changes', async () => {
      const permit = { ...TEST_PERMIT_2 };
      const peachSummary = {
        ...TEST_PEACH_SUMMARY,
        stage: permit.stage,
        state: permit.state,
        onHoldCode: permit.onHoldCode,
        submittedDate: permit.submittedDate,
        decisionDate: permit.decisionDate,
        statusLastChanged: permit.statusLastChanged
      };

      const result = await applyPeachUpdates(mockRepos, [trackingRecordFor(permit as never)], {
        [key]: peachSummary
      } as never);

      expect(mockRepos.permit.upsert).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
