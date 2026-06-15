import { appAxios } from '@/services/interceptors';
import { deleteSubjectGroup, getAuthorizationContext, listGroups, yarsService } from '@/services/yarsService';

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

  describe('getAuthorizationContext', () => {
    it('returns permissions data', async () => {
      const response = {
        canEdit: true,
        canDelete: false
      };

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await getAuthorizationContext();

      expect(mockGet).toHaveBeenCalledWith('yars/permissions', undefined);
      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('permission fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(getAuthorizationContext()).rejects.toThrow(error);
    });
  });

  describe('listGroups', () => {
    it('returns groups for initiative', async () => {
      const response = [
        { id: 1, name: 'Group A' },
        { id: 2, name: 'Group B' }
      ];

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await listGroups({
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

      const result = await listGroups({
        initiative: 'TEST_INITIATIVE'
      } as never);

      expect(result).toEqual([]);
    });

    it('propagates errors', async () => {
      const error = new Error('network error');

      mockGet.mockRejectedValue(error);

      await expect(
        listGroups({
          initiative: 'TEST_INITIATIVE'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(yarsService).toEqual({
      deleteSubjectGroup,
      getAuthorizationContext,
      listGroups
    });
  });
});
