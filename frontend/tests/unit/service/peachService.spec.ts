import { appAxios } from '@/services/interceptors';
import { getPeachSummary, peachService } from '@/services/peachService';

import type { GetPeachSummaryRequest } from '@/types';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('peach service', () => {
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      post: mockPost
    } as never);
  });

  describe('getPeachSummary', () => {
    it('returns a peach summary', async () => {
      const request: GetPeachSummaryRequest = {
        data: [
          {
            permitTrackingId: 'tracking-1' as never,
            permitId: 'permit-1' as never,
            shownToProponent: true,
            trackingId: 'TRACK-001'
          },
          {
            permitTrackingId: 'tracking-2' as never,
            permitId: 'permit-2' as never,
            shownToProponent: false,
            trackingId: 'TRACK-002'
          }
        ]
      };

      const response = {
        totalRecords: 2,
        completedRecords: 1
      };

      mockPost.mockResolvedValue({
        data: response
      });

      const result = await getPeachSummary(request);

      expect(mockPost).toHaveBeenCalledWith('peach/record', request, undefined);

      expect(result).toEqual(response);
    });

    it('returns an empty summary when no permit tracking records are provided', async () => {
      const request: GetPeachSummaryRequest = {
        data: []
      };

      const response = {
        totalRecords: 0,
        completedRecords: 0
      };

      mockPost.mockResolvedValue({
        data: response
      });

      const result = await getPeachSummary(request);

      expect(mockPost).toHaveBeenCalledWith('peach/record', request, undefined);

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const request: GetPeachSummaryRequest = {
        data: [
          {
            shownToProponent: true,
            trackingId: 'TRACK-001'
          }
        ]
      };

      const error = new Error('fetch failed');

      mockPost.mockRejectedValue(error);

      await expect(getPeachSummary(request)).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(peachService).toEqual({
      getPeachSummary
    });
  });
});
