import { appAxios } from '@/services/interceptors';
import { searchIdirUsers, ssoService } from '@/services/ssoService';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('sso service', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet
    } as never);
  });

  describe('searchIdirUsers', () => {
    it('returns idir users with search criteria', async () => {
      const filters = {
        searchText: 'smith'
      };

      const users = [
        {
          firstName: 'John',
          lastName: 'Smith',
          username: 'JSMITH'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          username: 'JANES'
        }
      ];

      mockGet.mockResolvedValue({
        data: users
      });

      const result = await searchIdirUsers(filters as never);

      expect(mockGet).toHaveBeenCalledWith('sso/idir/users', {
        params: filters,
        cancelToken: undefined
      });

      expect(result).toEqual(users);
    });

    it('passes cancel token when supplied', async () => {
      const filters = {
        searchText: 'smith'
      };

      const cancelToken = {} as never;

      mockGet.mockResolvedValue({
        data: []
      });

      await searchIdirUsers(filters as never, cancelToken);

      expect(mockGet).toHaveBeenCalledWith('sso/idir/users', {
        params: filters,
        cancelToken
      });
    });

    it('propagates errors', async () => {
      const error = new Error('search failed');

      mockGet.mockRejectedValue(error);

      await expect(searchIdirUsers({} as never)).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(ssoService).toEqual({
      searchIdirUsers
    });
  });
});
