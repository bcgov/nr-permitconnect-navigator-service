import { roadmapService, sendRoadmap, getRoadmapNote } from '@/services/roadmapService';

import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('roadmap service', () => {
  const mockPut = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      put: mockPut,
      get: mockGet
    } as never);
  });

  describe('sendRoadmap', () => {
    it('sends roadmap email and returns data', async () => {
      const response = {
        success: true
      };

      mockPut.mockResolvedValue({
        data: response
      });

      const result = await sendRoadmap({
        activityId: 'activity-1',
        selectedFileIds: ['file-1', 'file-2'],
        emailData: {
          to: ['test@test.com'],
          cc: [],
          bcc: [],
          subject: 'Roadmap'
        }
      } as never);

      expect(mockPut).toHaveBeenCalledWith(
        'housing/roadmap',
        {
          activityId: 'activity-1',
          selectedFileIds: ['file-1', 'file-2'],
          emailData: {
            to: ['test@test.com'],
            cc: [],
            bcc: [],
            subject: 'Roadmap'
          }
        },
        undefined
      );

      expect(result).toEqual(response);
    });

    it('normalizes string email fields', async () => {
      mockPut.mockResolvedValue({
        data: {}
      });

      await sendRoadmap({
        activityId: 'activity-1',
        selectedFileIds: ['file-1'],
        emailData: {
          to: 'to@test.com',
          cc: 'cc@test.com',
          bcc: 'bcc@test.com'
        }
      } as never);

      expect(mockPut).toHaveBeenCalledWith(
        'housing/roadmap',
        {
          activityId: 'activity-1',
          selectedFileIds: ['file-1'],
          emailData: {
            to: ['to@test.com'],
            cc: ['cc@test.com'],
            bcc: ['bcc@test.com']
          }
        },
        undefined
      );
    });

    it('splits multiple email addresses', async () => {
      mockPut.mockResolvedValue({
        data: {}
      });

      await sendRoadmap({
        activityId: 'activity-1',
        selectedFileIds: ['file-1'],
        emailData: {
          to: 'a@test.com; b@test.com, c@test.com'
        }
      } as never);

      expect(mockPut).toHaveBeenCalledWith(
        'housing/roadmap',
        {
          activityId: 'activity-1',
          selectedFileIds: ['file-1'],
          emailData: {
            to: ['a@test.com', 'b@test.com', 'c@test.com'],
            cc: []
          }
        },
        undefined
      );
    });

    it('defaults cc to an empty array when not supplied', async () => {
      mockPut.mockResolvedValue({
        data: {}
      });

      await sendRoadmap({
        activityId: 'activity-1',
        selectedFileIds: ['file-1'],
        emailData: {
          to: ['test@test.com']
        }
      } as never);

      expect(mockPut).toHaveBeenCalledWith(
        'housing/roadmap',
        {
          activityId: 'activity-1',
          selectedFileIds: ['file-1'],
          emailData: {
            to: ['test@test.com'],
            cc: []
          }
        },
        undefined
      );
    });

    it('does not modify array email fields', async () => {
      mockPut.mockResolvedValue({
        data: {}
      });

      await sendRoadmap({
        activityId: 'activity-1',
        selectedFileIds: ['file-1'],
        emailData: {
          to: ['to@test.com'],
          cc: ['cc@test.com'],
          bcc: ['bcc@test.com']
        }
      } as never);

      expect(mockPut).toHaveBeenCalledWith(
        'housing/roadmap',
        {
          activityId: 'activity-1',
          selectedFileIds: ['file-1'],
          emailData: {
            to: ['to@test.com'],
            cc: ['cc@test.com'],
            bcc: ['bcc@test.com']
          }
        },
        undefined
      );
    });

    it('propagates errors', async () => {
      const error = new Error('send failed');

      mockPut.mockRejectedValue(error);

      await expect(
        sendRoadmap({
          activityId: 'activity-1',
          selectedFileIds: [],
          emailData: {}
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('getRoadmapNote', () => {
    it('returns roadmap note', async () => {
      const note = 'Roadmap note content';

      mockGet.mockResolvedValue({
        data: note
      });

      const result = await getRoadmapNote({
        activityId: 'activity-1'
      });

      expect(mockGet).toHaveBeenCalledWith('housing/roadmap/note', {
        params: {
          activityId: 'activity-1'
        }
      });

      expect(result).toEqual(note);
    });

    it('propagates errors', async () => {
      const error = new Error('get failed');

      mockGet.mockRejectedValue(error);

      await expect(
        getRoadmapNote({
          activityId: 'activity-1'
        })
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(roadmapService).toEqual({
      sendRoadmap,
      getRoadmapNote
    });
  });
});
