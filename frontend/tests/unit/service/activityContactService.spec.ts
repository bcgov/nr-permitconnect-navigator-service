import { appAxios } from '@/services/interceptors';

import {
  createActivityContact,
  deleteActivityContact,
  listActivityContacts,
  putActivityContact,
  activityContactService
} from '@/services/activityContactService';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('activity contact service', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockDelete = vi.fn();
  const mockPut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
      put: mockPut
    } as never);
  });

  describe('createActivityContact', () => {
    it('creates an activity contact', async () => {
      const response = {
        id: 'ac-1',
        role: 'PRIMARY'
      };

      mockPost.mockResolvedValue({
        data: response
      });

      const result = await createActivityContact({
        activityId: 'activity-1',
        contactId: 'contact-1',
        role: 'PRIMARY'
      } as never);

      expect(mockPost).toHaveBeenCalledWith('activity/activity-1/contact/contact-1', { role: 'PRIMARY' }, undefined);

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('create failed');

      mockPost.mockRejectedValue(error);

      await expect(
        createActivityContact({
          activityId: 'activity-1',
          contactId: 'contact-1',
          role: 'PRIMARY'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('deleteActivityContact', () => {
    it('deletes an activity contact', async () => {
      mockDelete.mockResolvedValue({});

      await deleteActivityContact({
        activityId: 'activity-1',
        contactId: 'contact-1'
      } as never);

      expect(mockDelete).toHaveBeenCalledWith('activity/activity-1/contact/contact-1', undefined);
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');

      mockDelete.mockRejectedValue(error);

      await expect(
        deleteActivityContact({
          activityId: 'activity-1',
          contactId: 'contact-1'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('listActivityContacts', () => {
    it('returns list of activity contacts', async () => {
      const response = [
        { id: 'ac-1', role: 'PRIMARY' },
        { id: 'ac-2', role: 'SECONDARY' }
      ];

      mockGet.mockResolvedValue({
        data: response
      });

      const result = await listActivityContacts({
        activityId: 'activity-1'
      } as never);

      expect(mockGet).toHaveBeenCalledWith('activity/activity-1/contact', undefined);

      expect(result).toEqual(response);
    });

    it('returns empty list when no contacts exist', async () => {
      mockGet.mockResolvedValue({
        data: []
      });

      const result = await listActivityContacts({
        activityId: 'activity-1'
      } as never);

      expect(result).toEqual([]);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGet.mockRejectedValue(error);

      await expect(
        listActivityContacts({
          activityId: 'activity-1'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('putActivityContact', () => {
    it('updates an activity contact', async () => {
      const response = {
        updated: { id: 'ac-1', role: 'PRIMARY_UPDATED' },
        demoted: undefined
      };

      mockPut.mockResolvedValue({
        data: response
      });

      const result = await putActivityContact({
        activityId: 'activity-1',
        contactId: 'contact-1',
        role: 'PRIMARY_UPDATED'
      } as never);

      expect(mockPut).toHaveBeenCalledWith(
        'activity/activity-1/contact/contact-1',
        { role: 'PRIMARY_UPDATED' },
        undefined
      );

      expect(result).toEqual(response);
    });

    it('handles demoted contact response', async () => {
      const response = {
        updated: { id: 'ac-1', role: 'PRIMARY_UPDATED' },
        demoted: { id: 'ac-2', role: 'SECONDARY' }
      };

      mockPut.mockResolvedValue({
        data: response
      });

      const result = await putActivityContact({
        activityId: 'activity-1',
        contactId: 'contact-1',
        role: 'PRIMARY_UPDATED'
      } as never);

      expect(result.demoted).toBeDefined();
    });

    it('propagates errors', async () => {
      const error = new Error('update failed');

      mockPut.mockRejectedValue(error);

      await expect(
        putActivityContact({
          activityId: 'activity-1',
          contactId: 'contact-1',
          role: 'PRIMARY_UPDATED'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(activityContactService).toEqual({
      createActivityContact,
      putActivityContact,
      deleteActivityContact,
      listActivityContacts
    });
  });
});
