import { getCodeTables, codeService } from '@/services/codeService';
import { appAxios } from '@/services/interceptors';

import type { Code, CodeTableName } from '@/types';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('code service', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet
    } as never);
  });

  describe('getCodeTables', () => {
    it('returns grouped code tables by CodeTableName', async () => {
      const response: Record<CodeTableName, Code[]> = {
        BusinessArea: [
          {
            code: 'BA-1',
            display: 'Business Area 1',
            definition: 'Definition 1',
            active: true
          }
        ],
        ElectrificationProjectCategory: [],
        ElectrificationProjectType: [],
        EscalationType: [],
        PermitStage: [],
        PermitState: [],
        PiesOnHold: [],
        SourceSystem: []
      };

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getCodeTables();

      expect(mockGet).toHaveBeenCalledWith('code', undefined);
      expect(result).toEqual(response);
    });

    it('returns empty grouped structure', async () => {
      const response: Record<CodeTableName, Code[]> = {
        BusinessArea: [],
        ElectrificationProjectCategory: [],
        ElectrificationProjectType: [],
        EscalationType: [],
        PermitStage: [],
        PermitState: [],
        PiesOnHold: [],
        SourceSystem: []
      };

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getCodeTables();

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(getCodeTables()).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(codeService).toEqual({
      getCodeTables
    });
  });
});
