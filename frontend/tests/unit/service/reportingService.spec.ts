import {
  reportingService,
  getElectrificationProjectPermitData,
  getGeneralProjectPermitData,
  getHousingProjectPermitData
} from '@/services/reportingService';

import { appAxios } from '@/services/interceptors';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('reporting service', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet
    } as never);
  });

  describe('getElectrificationProjectPermitData', () => {
    it('returns electrification permit data', async () => {
      const response = [{ project_name: 'Project A' }, { project_name: 'Project B' }];

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getElectrificationProjectPermitData();

      expect(mockGet).toHaveBeenCalledWith('reporting/electrificationProject/permit');

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(getElectrificationProjectPermitData()).rejects.toThrow(error);
    });
  });

  describe('getGeneralProjectPermitData', () => {
    it('returns general permit data', async () => {
      const response = [{ project_name: 'General A' }];

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getGeneralProjectPermitData();

      expect(mockGet).toHaveBeenCalledWith('reporting/generalProject/permit');

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(getGeneralProjectPermitData()).rejects.toThrow(error);
    });
  });

  describe('getHousingProjectPermitData', () => {
    it('returns housing permit data', async () => {
      const response = [{ project_name: 'Housing A' }];

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getHousingProjectPermitData();

      expect(mockGet).toHaveBeenCalledWith('reporting/housingProject/permit');

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(getHousingProjectPermitData()).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(reportingService).toEqual({
      getElectrificationProjectPermitData,
      getGeneralProjectPermitData,
      getHousingProjectPermitData
    });
  });
});
