import {
  createAccessRequest,
  processAccessRequest,
  listAccessRequests,
  accessRequestService
} from '@/services/accessRequestService';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('accessRequestService', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      post: mockPost
    } as never);
  });

  describe('createAccessRequest', () => {
    it('creates an access request and returns the created resource', async () => {
      const request = {
        userId: 'user-1',
        roleId: 'role-1'
      };

      const accessRequest = {
        accessRequestId: 'access-request-1',
        userId: 'user-1'
      };

      mockPost.mockResolvedValue({
        data: accessRequest
      });

      const result = await createAccessRequest(request as never);

      expect(mockPost).toHaveBeenCalledWith('housing/accessRequest', request);

      expect(result).toEqual(accessRequest);
    });

    it('propagates errors', async () => {
      const error = new Error('create failed');

      mockPost.mockRejectedValue(error);

      await expect(createAccessRequest({} as never)).rejects.toThrow(error);
    });
  });

  describe('processAccessRequest', () => {
    it('processes an access request and returns the updated resource', async () => {
      const request = {
        accessRequestId: 'access-request-1',
        status: 'Approved',
        comments: 'Approved by admin'
      };

      const updatedAccessRequest = {
        accessRequestId: 'access-request-1',
        status: 'Approved'
      };

      mockPost.mockResolvedValue({
        data: updatedAccessRequest
      });

      const result = await processAccessRequest(request as never);

      expect(mockPost).toHaveBeenCalledWith('housing/accessRequest/access-request-1', {
        status: 'Approved',
        comments: 'Approved by admin'
      });

      expect(result).toEqual(updatedAccessRequest);
    });

    it('sends only the request body excluding accessRequestId', async () => {
      mockPost.mockResolvedValue({
        data: {}
      });

      await processAccessRequest({
        accessRequestId: 'access-request-1',
        status: 'Denied'
      } as never);

      expect(mockPost).toHaveBeenCalledWith('housing/accessRequest/access-request-1', {
        status: 'Denied'
      });
    });

    it('propagates errors', async () => {
      const error = new Error('process failed');

      mockPost.mockRejectedValue(error);

      await expect(
        processAccessRequest({
          accessRequestId: 'access-request-1'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('listAccessRequests', () => {
    it('returns all access requests', async () => {
      const accessRequests = [
        {
          accessRequestId: '1'
        },
        {
          accessRequestId: '2'
        }
      ];

      mockGet.mockResolvedValue({
        data: accessRequests
      });

      const result = await listAccessRequests();

      expect(mockGet).toHaveBeenCalledWith('housing/accessRequest');

      expect(result).toEqual(accessRequests);
    });

    it('propagates errors', async () => {
      const error = new Error('list failed');

      mockGet.mockRejectedValue(error);

      await expect(listAccessRequests()).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(accessRequestService).toEqual({
      createAccessRequest,
      processAccessRequest,
      listAccessRequests
    });
  });
});
