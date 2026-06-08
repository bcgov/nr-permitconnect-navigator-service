import { appAxios } from '@/services/interceptors';
import {
  permitService,
  deletePermit,
  getPermit,
  listPermits,
  listPermitTypes,
  searchPermits,
  upsertPermit
} from '@/services/permitService';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('permit service', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      put: mockPut,
      delete: mockDelete
    } as never);
  });

  describe('deletePermit', () => {
    it('calls delete with the correct url', async () => {
      mockDelete.mockResolvedValue({});

      await deletePermit({
        permitId: 'permit-123'
      });

      expect(mockDelete).toHaveBeenCalledWith('housing/permit/permit-123');
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');

      mockDelete.mockRejectedValue(error);

      await expect(deletePermit({ permitId: 'permit-123' })).rejects.toThrow(error);
    });
  });

  describe('getPermit', () => {
    it('returns permit data', async () => {
      const permit = {
        permitId: 'permit-123'
      };

      mockGet.mockResolvedValue({
        data: permit
      });

      const result = await getPermit({
        permitId: 'permit-123'
      });

      expect(mockGet).toHaveBeenCalledWith('housing/permit/permit-123');

      expect(result).toEqual(permit);
    });

    it('propagates errors', async () => {
      const error = new Error('get failed');

      mockGet.mockRejectedValue(error);

      await expect(getPermit({ permitId: 'permit-123' })).rejects.toThrow(error);
    });
  });

  describe('listPermitTypes', () => {
    it('returns permit types', async () => {
      const permitTypes = [{ code: 'TYPE1' }, { code: 'TYPE2' }];

      mockGet.mockResolvedValue({
        data: permitTypes
      });

      const result = await listPermitTypes({
        initiative: Initiative.HOUSING
      });

      expect(mockGet).toHaveBeenCalledWith('housing/permit/types', {
        params: {
          initiative: Initiative.HOUSING
        }
      });

      expect(result).toEqual(permitTypes);
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

  describe('listPermits', () => {
    it('returns permits with filters', async () => {
      const permits = [{ permitId: '1' }, { permitId: '2' }];

      const options = {
        page: 1,
        pageSize: 25
      };

      mockGet.mockResolvedValue({
        data: permits
      });

      const result = await listPermits(options as never);

      expect(mockGet).toHaveBeenCalledWith('housing/permit', {
        params: options
      });

      expect(result).toEqual(permits);
    });

    it('supports undefined options', async () => {
      mockGet.mockResolvedValue({
        data: []
      });

      await listPermits();

      expect(mockGet).toHaveBeenCalledWith('housing/permit', {
        params: undefined
      });
    });

    it('propagates errors', async () => {
      const error = new Error('list failed');

      mockGet.mockRejectedValue(error);

      await expect(listPermits()).rejects.toThrow(error);
    });
  });

  describe('searchPermits', () => {
    it('returns permits and totalRecords', async () => {
      const response = {
        permits: [{ permitId: '1' }, { permitId: '2' }],
        totalRecords: 2
      };

      const filters = {
        searchText: 'test'
      };

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await searchPermits(filters as never);

      expect(mockGet).toHaveBeenCalledWith('housing/permit/search', {
        params: filters
      });

      expect(result).toEqual(response);
    });

    it('supports undefined filters', async () => {
      mockGet.mockResolvedValue({
        data: {
          permits: [],
          totalRecords: 0
        }
      });

      await searchPermits();

      expect(mockGet).toHaveBeenCalledWith('housing/permit/search', {
        params: undefined
      });
    });

    it('propagates errors', async () => {
      const error = new Error('search failed');

      mockGet.mockRejectedValue(error);

      await expect(searchPermits()).rejects.toThrow(error);
    });
  });

  describe('upsertPermit', () => {
    it('puts permit and returns response data', async () => {
      const permit = {
        permitId: 'permit-123',
        permitNumber: 'P-001'
      };

      mockPut.mockResolvedValue({
        data: permit
      });

      const result = await upsertPermit(permit as never);

      expect(mockPut).toHaveBeenCalledWith('housing/permit', permit);

      expect(result).toEqual(permit);
    });

    it('propagates errors', async () => {
      const error = new Error('upsert failed');

      mockPut.mockRejectedValue(error);

      await expect(upsertPermit({} as never)).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(permitService).toEqual({
      deletePermit,
      getPermit,
      listPermits,
      listPermitTypes,
      searchPermits,
      upsertPermit
    });
  });
});
