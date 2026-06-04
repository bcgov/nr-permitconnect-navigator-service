import { appAxios } from '@/services/interceptors';
import { deleteSubjectGroup, getGroups, getPermissions, yarsService } from '@/services/yarsService';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('yars service', () => {
  const mockGet = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      delete: mockDelete
    } as never);
  });

  describe('getGroups', () => {
    it('returns groups for initiative', async () => {
      const response = [
        { id: 1, name: 'Group A' },
        { id: 2, name: 'Group B' }
      ];

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getGroups({
        initiative: 'TEST_INITIATIVE'
      } as never);

      expect(mockGet).toHaveBeenCalledWith('yars/groups', {
        params: {
          initiative: 'TEST_INITIATIVE'
        }
      });

      expect(result).toEqual(response);
    });

    it('returns empty array when no groups exist', async () => {
      mockGet.mockResolvedValue({
        data: []
      });

      const result = await getGroups({
        initiative: 'TEST_INITIATIVE'
      } as never);

      expect(result).toEqual([]);
    });

    it('propagates errors', async () => {
      const error = new Error('network error');

      mockGet.mockRejectedValue(error);

      await expect(
        getGroups({
          initiative: 'TEST_INITIATIVE'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('getPermissions', () => {
    it('returns permissions data', async () => {
      const response = {
        canEdit: true,
        canDelete: false
      };

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getPermissions();

      expect(mockGet).toHaveBeenCalledWith('yars/permissions');
      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('permission fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(getPermissions()).rejects.toThrow(error);
    });
  });

  describe('deleteSubjectGroup', () => {
    it('calls delete with correct payload', async () => {
      mockDelete.mockResolvedValue({});

      await deleteSubjectGroup({
        sub: 'subject-123',
        groupId: 99
      } as never);

      expect(mockDelete).toHaveBeenCalledWith('yars/subject/group', {
        data: {
          sub: 'subject-123',
          groupId: 99
        }
      });
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');

      mockDelete.mockRejectedValue(error);

      await expect(
        deleteSubjectGroup({
          sub: 'subject-123',
          groupId: 99
        } as never)
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(yarsService).toEqual({
      getGroups,
      getPermissions,
      deleteSubjectGroup
    });
  });
});
