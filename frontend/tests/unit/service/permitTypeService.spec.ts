import { appAxios } from '@/services/interceptors';
import { listPermitTypes, permitTypeService } from '@/services/permitTypeService';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('permit type service', () => {
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

  describe('listPermitTypes', () => {
    it('returns permit types', async () => {
      const permitTypes = [{ code: 'TYPE1' }, { code: 'TYPE2' }];

      mockGet.mockResolvedValue({
        data: permitTypes
      });

      const result = await listPermitTypes({});

      expect(mockGet).toHaveBeenCalledWith('permit-type', {
        params: {
          initiative: undefined
        }
      });

      expect(result).toEqual(permitTypes);
    });

    it('passes query parameters', async () => {
      mockGet.mockResolvedValue({
        data: []
      });

      await listPermitTypes({
        initiative: Initiative.HOUSING
      });

      expect(mockGet).toHaveBeenCalledWith('permit-type', {
        params: {
          initiative: Initiative.HOUSING
        }
      });
    });

    it('propagates errors', async () => {
      const error = new Error('types failed');

      mockGet.mockRejectedValue(error);

      await expect(
        listPermitTypes({
          initiative: Initiative.HOUSING
        })
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(permitTypeService).toEqual({
      listPermitTypes
    });
  });
});
