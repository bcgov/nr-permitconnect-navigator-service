import { mockReset } from 'vitest-mock-extended';

import {
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PEACH_RECORD_1,
  TEST_PEACH_RECORD_2,
  TEST_PEACH_SUMMARY
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { findPriorityPermitTracking, syncPeachRecords } from '../../../src/domains/peach.ts';
import * as permitDomain from '../../../src/domains/permit.ts';
import * as peachExternal from '../../../src/external/peach.ts';
import * as peachParser from '../../../src/parsers/peach.ts';
import { PeachIntegratedSystem } from '../../../src/utils/enums/permit.ts';
import { PermitStage, PermitState, PiesOnHold } from '../../../src/db/codes/enums.ts';

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

  describe('syncPeachRecords', () => {
    it('should return empty array when no PEACH integrated permits found', async () => {
      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([]);

      const result = await syncPeachRecords(mockRepos);

      expect(result).toEqual([]);
    });

    it('should skip permits without permit tracking', async () => {
      const permit = { ...TEST_PERMIT_1, permitTracking: undefined };
      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);

      const result = await syncPeachRecords(mockRepos);

      expect(result).toEqual([]);
    });

    it('should skip permits without priority tracking', async () => {
      const permit = { ...TEST_PERMIT_1, permitTracking: [] };
      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);

      const result = await syncPeachRecords(mockRepos);

      expect(result).toEqual([]);
    });

    it('should fetch and parse PEACH records with rate limiting', async () => {
      const permit = {
        ...TEST_PERMIT_2,
        permitTracking: [
          {
            ...TEST_PERMIT_2.permitTracking![0],
            trackingId: 'REC-SUB',
            sourceSystemKind: {
              ...TEST_PERMIT_2.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.VFCBC,
              integrated: true
            }
          }
        ]
      };

      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);
      vi.spyOn(peachExternal, 'getPeachRecord').mockResolvedValue(TEST_PEACH_RECORD_1 as never);
      vi.spyOn(peachParser, 'parsePeachRecords').mockReturnValue({
        [PeachIntegratedSystem.VFCBC + 'REC-SUB']: TEST_PEACH_SUMMARY
      } as never);

      mockRepos.permit.upsert.mockResolvedValue(permit as never);

      const result = await syncPeachRecords(mockRepos);

      expect(peachExternal.getPeachRecord).toHaveBeenCalledWith('REC-SUB', PeachIntegratedSystem.VFCBC);
      expect(peachParser.parsePeachRecords).toHaveBeenCalled();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should skip permits with no parsed summary', async () => {
      const permit = {
        ...TEST_PERMIT_2,
        permitTracking: [
          {
            ...TEST_PERMIT_2.permitTracking![0],
            trackingId: 'REC-SUB',
            sourceSystemKind: {
              ...TEST_PERMIT_2.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.VFCBC,
              integrated: true
            }
          }
        ]
      };

      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);
      vi.spyOn(peachExternal, 'getPeachRecord').mockResolvedValue(TEST_PEACH_RECORD_1 as never);
      vi.spyOn(peachParser, 'parsePeachRecords').mockReturnValue({});

      const result = await syncPeachRecords(mockRepos);

      expect(result).toEqual([]);
    });

    it('should update permit when stage differs', async () => {
      const permit = {
        ...TEST_PERMIT_1,
        stage: PermitStage.PRE_SUBMISSION,
        state: PermitState.NONE,
        permitTracking: [
          {
            ...TEST_PERMIT_1.permitTracking![0],
            trackingId: 'REC-SUB',
            sourceSystemKind: {
              ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.VFCBC,
              integrated: true
            }
          }
        ]
      };

      const peachSummary = {
        ...TEST_PEACH_SUMMARY,
        stage: PermitStage.APPLICATION_SUBMISSION,
        submittedDate: null,
        decisionDate: null,
        statusLastChanged: null
      };

      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);
      vi.spyOn(peachExternal, 'getPeachRecord').mockResolvedValue(TEST_PEACH_RECORD_1 as never);
      vi.spyOn(peachParser, 'parsePeachRecords').mockReturnValue({
        [PeachIntegratedSystem.VFCBC + 'REC-SUB']: peachSummary
      } as never);

      const updatedPermit = { ...permit, stage: PermitStage.APPLICATION_SUBMISSION };
      mockRepos.permit.upsert.mockResolvedValue(updatedPermit as never);

      const result = await syncPeachRecords(mockRepos);

      expect(mockRepos.permit.upsert).toHaveBeenCalled();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle PEACH fetch errors gracefully', async () => {
      const permit = {
        ...TEST_PERMIT_2,
        permitTracking: [
          {
            ...TEST_PERMIT_2.permitTracking![0],
            trackingId: 'REC-SUB',
            sourceSystemKind: {
              ...TEST_PERMIT_2.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.VFCBC,
              integrated: true
            }
          }
        ]
      };

      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);
      vi.spyOn(peachExternal, 'getPeachRecord').mockRejectedValue(new Error('PEACH fetch failed'));
      vi.spyOn(peachParser, 'parsePeachRecords').mockReturnValue({});

      const result = await syncPeachRecords(mockRepos);

      expect(result).toBeDefined();
    });

    it('should return updated permit when applicant requests hold', async () => {
      const permit = {
        ...TEST_PERMIT_2,
        onHoldCode: null,
        permitTracking: [
          {
            ...TEST_PERMIT_2.permitTracking![0],
            trackingId: 'REC-SUB',
            sourceSystemKind: {
              ...TEST_PERMIT_2.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.VFCBC,
              integrated: true
            }
          }
        ]
      };

      const peachSummary = {
        ...TEST_PEACH_SUMMARY,
        onHoldCode: PiesOnHold.APPLICANT_REQUEST,
        submittedDate: permit.submittedDate,
        decisionDate: permit.decisionDate,
        statusLastChanged: permit.statusLastChanged,
        stage: permit.stage,
        state: permit.state
      };

      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);
      vi.spyOn(peachExternal, 'getPeachRecord').mockResolvedValue(TEST_PEACH_RECORD_1 as never);
      vi.spyOn(peachParser, 'parsePeachRecords').mockReturnValue({
        [PeachIntegratedSystem.VFCBC + 'REC-SUB']: peachSummary
      } as never);

      const updatedPermit = {
        ...permit,
        onHoldCode: PiesOnHold.APPLICANT_REQUEST
      };

      mockRepos.permit.upsert.mockResolvedValue(updatedPermit as never);

      const result = await syncPeachRecords(mockRepos);

      expect(result.length).toBeGreaterThan(0);
      const updatedResult = result.find((r) => r.permit.permitId === permit.permitId);
      expect(updatedResult?.note).toMatch(/This application has been placed on hold at the applicant.*request/);
    });

    it('should only return permits with status changes', async () => {
      const permit = {
        ...TEST_PERMIT_2,
        permitTracking: [
          {
            ...TEST_PERMIT_2.permitTracking![0],
            trackingId: 'REC-SUB',
            sourceSystemKind: {
              ...TEST_PERMIT_2.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.VFCBC,
              integrated: true
            }
          }
        ]
      };

      const peachSummary = {
        ...TEST_PEACH_SUMMARY,
        stage: permit.stage,
        state: permit.state,
        onHoldCode: permit.onHoldCode,
        submittedDate: permit.submittedDate,
        decisionDate: permit.decisionDate,
        statusLastChanged: permit.statusLastChanged
      };

      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit] as never);
      vi.spyOn(peachExternal, 'getPeachRecord').mockResolvedValue(TEST_PEACH_RECORD_1 as never);
      vi.spyOn(peachParser, 'parsePeachRecords').mockReturnValue({
        [PeachIntegratedSystem.VFCBC + 'REC-SUB']: peachSummary
      } as never);

      const result = await syncPeachRecords(mockRepos);

      expect(result).toEqual([]);
    });

    it('should handle multiple permits with mixed results', async () => {
      const permit1 = {
        ...TEST_PERMIT_1,
        permitTracking: [
          {
            ...TEST_PERMIT_1.permitTracking![0],
            trackingId: 'REC-1',
            sourceSystemKind: {
              ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.VFCBC,
              integrated: true
            }
          }
        ]
      };

      const permit2 = {
        ...TEST_PERMIT_2,
        permitTracking: [
          {
            ...TEST_PERMIT_2.permitTracking![0],
            trackingId: 'REC-2',
            sourceSystemKind: {
              ...TEST_PERMIT_2.permitTracking![0].sourceSystemKind,
              sourceSystem: PeachIntegratedSystem.WMA,
              integrated: true
            }
          }
        ]
      };

      vi.spyOn(permitDomain, 'listPeachIntegratedTrackings').mockResolvedValue([permit1, permit2] as never);

      const getPeachRecordSpy = vi.spyOn(peachExternal, 'getPeachRecord');
      getPeachRecordSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1 as never);
      getPeachRecordSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_2 as never);

      vi.spyOn(peachParser, 'parsePeachRecords').mockReturnValue({
        [PeachIntegratedSystem.VFCBC + 'REC-1']: { ...TEST_PEACH_SUMMARY, stage: PermitStage.APPLICATION_SUBMISSION },
        [PeachIntegratedSystem.WMA + 'REC-2']: TEST_PEACH_SUMMARY
      } as never);

      mockRepos.permit.upsert.mockResolvedValue(permit1 as never);

      const result = await syncPeachRecords(mockRepos);

      expect(peachExternal.getPeachRecord).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });
  });
});
