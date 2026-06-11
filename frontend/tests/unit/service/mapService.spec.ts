import { getPids, mapService } from '@/services/mapService';

import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('map service', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet
    } as never);
  });

  describe('getPids', () => {
    it('returns PIDs as CSV string', async () => {
      const response = 'pid-1,pid-2,pid-3';

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getPids({
        projectId: 'project-123'
      } as never);

      expect(mockGet).toHaveBeenCalledWith('housing/map/pids/project-123');

      expect(result).toEqual(response);
    });

    it('returns empty string when no PIDs exist', async () => {
      mockGet.mockResolvedValue({
        data: ''
      });

      const result = await getPids({
        projectId: 'project-123'
      } as never);

      expect(mockGet).toHaveBeenCalledWith('housing/map/pids/project-123');

      expect(result).toEqual('');
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(
        getPids({
          projectId: 'project-123'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(mapService).toEqual({
      getPids
    });
  });
});
