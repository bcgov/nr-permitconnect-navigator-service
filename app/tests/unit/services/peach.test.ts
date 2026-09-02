import * as peachDomain from '#src/domains/peach';
import * as peachExternal from '#src/external/peach';
import * as peachParser from '#src/parsers/peach';
import * as peachService from '#src/services/peach';
import Problem from '#src/utils/problem';

import type { PermitTracking } from '#types';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.env') return 'ci';
        if (key === 'server.pcns.appUrl') return 'www.example.com';
        if (key === 'server.pcbcUrl') return 'www.example.com';

        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

const findPriorityPermitTrackingSpy = vi.spyOn(peachDomain, 'findPriorityPermitTracking');
const getPeachRecordSpy = vi.spyOn(peachExternal, 'getPeachRecord');
const summarizePeachRecordSpy = vi.spyOn(peachParser, 'summarizePeachRecord');

describe('peach service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPeachSummaryService', () => {
    it('throws 422 if no priority permit tracking is found', async () => {
      findPriorityPermitTrackingSpy.mockReturnValueOnce(undefined);

      await expect(peachService.getPeachSummaryService([])).rejects.toThrow(
        new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' })
      );
    });

    it('throws 422 if tracking ID is missing', async () => {
      const invalidTracking = {
        sourceSystemKind: { sourceSystem: 'VFCBC' }
      } as PermitTracking;
      findPriorityPermitTrackingSpy.mockReturnValueOnce(invalidTracking);

      await expect(peachService.getPeachSummaryService([invalidTracking])).rejects.toThrow(
        new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' })
      );
    });

    it('throws 422 if source system is missing', async () => {
      const invalidTracking = {
        trackingId: 'TRACK-123',
        sourceSystemKind: {}
      } as PermitTracking;
      findPriorityPermitTrackingSpy.mockReturnValueOnce(invalidTracking);

      await expect(peachService.getPeachSummaryService([invalidTracking])).rejects.toThrow(
        new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' })
      );
    });

    it('throws 500 if PEACH summary cannot be derived from fetched PEACH data', async () => {
      const validTracking = {
        trackingId: 'TRACK-123',
        sourceSystemKind: { sourceSystem: 'VFCBC' }
      } as PermitTracking;

      findPriorityPermitTrackingSpy.mockReturnValueOnce(validTracking);
      getPeachRecordSpy.mockResolvedValueOnce({} as never);
      summarizePeachRecordSpy.mockReturnValueOnce(undefined as never);

      await expect(peachService.getPeachSummaryService([validTracking])).rejects.toThrow(
        new Problem(500, { detail: 'No status data could be derived from the PEACH record that was found.' })
      );
    });

    it('returns PEACH summary on success', async () => {
      const validTracking = {
        trackingId: 'TRACK-123',
        sourceSystemKind: { sourceSystem: 'VFCBC' }
      } as PermitTracking;
      const mockSummary = { status: 'APPROVED' };

      findPriorityPermitTrackingSpy.mockReturnValueOnce(validTracking);
      getPeachRecordSpy.mockResolvedValueOnce({} as never);
      summarizePeachRecordSpy.mockReturnValueOnce(mockSummary as never);

      const result = await peachService.getPeachSummaryService([validTracking]);

      expect(getPeachRecordSpy).toHaveBeenCalledWith('TRACK-123', 'VFCBC');
      expect(result).toStrictEqual(mockSummary);
    });
  });
});
