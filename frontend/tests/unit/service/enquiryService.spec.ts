import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  enquiryService,
  createEnquiry,
  deleteEnquiry,
  getEnquiry,
  listEnquiries,
  listRelatedEnquiries,
  patchEnquiry,
  searchEnquiries
} from '@/services/enquiryService';

import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('enquiryService', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPatch = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete
    } as never);
  });

  describe('createEnquiry', () => {
    it('creates an enquiry and returns the created resource', async () => {
      const request = {
        activityId: 'activity-1',
        enquiryType: 'General'
      };

      const enquiry = {
        enquiryId: 'enquiry-1'
      };

      mockPost.mockResolvedValue({
        data: enquiry
      });

      const result = await createEnquiry(request as never);

      expect(mockPost).toHaveBeenCalledWith('housing/enquiry', request);

      expect(result).toEqual(enquiry);
    });

    it('propagates errors', async () => {
      const error = new Error('create failed');

      mockPost.mockRejectedValue(error);

      await expect(createEnquiry({} as never)).rejects.toThrow(error);
    });
  });

  describe('deleteEnquiry', () => {
    it('deletes an enquiry', async () => {
      mockDelete.mockResolvedValue({});

      await deleteEnquiry({
        enquiryId: 'enquiry-1'
      });

      expect(mockDelete).toHaveBeenCalledWith('housing/enquiry/enquiry-1');
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');

      mockDelete.mockRejectedValue(error);

      await expect(
        deleteEnquiry({
          enquiryId: 'enquiry-1'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('getEnquiry', () => {
    it('returns an enquiry', async () => {
      const enquiry = {
        enquiryId: 'enquiry-1'
      };

      mockGet.mockResolvedValue({
        data: enquiry
      });

      const result = await getEnquiry({
        enquiryId: 'enquiry-1'
      });

      expect(mockGet).toHaveBeenCalledWith('housing/enquiry/enquiry-1');

      expect(result).toEqual(enquiry);
    });

    it('propagates errors', async () => {
      const error = new Error('get failed');

      mockGet.mockRejectedValue(error);

      await expect(
        getEnquiry({
          enquiryId: 'enquiry-1'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('listEnquiries', () => {
    it('returns all enquiries', async () => {
      const enquiries = [{ enquiryId: '1' }, { enquiryId: '2' }];

      mockGet.mockResolvedValue({
        data: enquiries
      });

      const result = await listEnquiries();

      expect(mockGet).toHaveBeenCalledWith('housing/enquiry');

      expect(result).toEqual(enquiries);
    });

    it('propagates errors', async () => {
      const error = new Error('list failed');

      mockGet.mockRejectedValue(error);

      await expect(listEnquiries()).rejects.toThrow(error);
    });
  });

  describe('listRelatedEnquiries', () => {
    it('returns enquiries related to an activity', async () => {
      const enquiries = [{ enquiryId: '1' }];

      mockGet.mockResolvedValue({
        data: enquiries
      });

      const result = await listRelatedEnquiries({
        activityId: 'activity-1'
      });

      expect(mockGet).toHaveBeenCalledWith('housing/enquiry/list/activity-1');

      expect(result).toEqual(enquiries);
    });

    it('propagates errors', async () => {
      const error = new Error('list failed');

      mockGet.mockRejectedValue(error);

      await expect(
        listRelatedEnquiries({
          activityId: 'activity-1'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('searchEnquiries', () => {
    it('posts search criteria and returns enquiries', async () => {
      const request = {
        activityId: 'activity-1'
      };

      const enquiries = [{ enquiryId: '1' }];

      mockPost.mockResolvedValue({
        data: enquiries
      });

      const result = await searchEnquiries(request as never);

      expect(mockPost).toHaveBeenCalledWith('housing/enquiry/search', request);

      expect(result).toEqual(enquiries);
    });

    it('propagates errors', async () => {
      const error = new Error('search failed');

      mockPost.mockRejectedValue(error);

      await expect(searchEnquiries({} as never)).rejects.toThrow(error);
    });
  });

  describe('patchEnquiry', () => {
    it('updates an enquiry and returns the updated resource', async () => {
      const request = {
        enquiryId: 'enquiry-1',
        status: 'Closed'
      };

      const enquiry = {
        enquiryId: 'enquiry-1',
        status: 'Closed'
      };

      mockPatch.mockResolvedValue({
        data: enquiry
      });

      const result = await patchEnquiry(request as never);

      expect(mockPatch).toHaveBeenCalledWith('housing/enquiry/enquiry-1', {
        status: 'Closed'
      });

      expect(result).toEqual(enquiry);
    });

    it('propagates errors', async () => {
      const error = new Error('patch failed');

      mockPatch.mockRejectedValue(error);

      await expect(
        patchEnquiry({
          enquiryId: 'enquiry-1'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(enquiryService).toEqual({
      createEnquiry,
      deleteEnquiry,
      getEnquiry,
      listEnquiries,
      listRelatedEnquiries,
      searchEnquiries,
      patchEnquiry
    });
  });
});
