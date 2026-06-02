import {
  noteHistoryService,
  createNoteHistory,
  deleteNoteHistory,
  listBringForwards,
  listNoteHistories,
  putNoteHistory
} from '@/services/noteHistoryService';

import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('noteHistory service', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      post: mockPost,
      get: mockGet,
      put: mockPut,
      delete: mockDelete
    } as never);
  });

  describe('createNoteHistory', () => {
    it('creates a note history record and returns data', async () => {
      const request = {
        activityId: 'activity-1',
        note: 'Test note'
      };

      const response = {
        noteHistoryId: 'note-history-1'
      };

      mockPost.mockResolvedValue({
        data: response
      });

      const result = await createNoteHistory(request as never);

      expect(mockPost).toHaveBeenCalledWith('housing/note', request);

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('create failed');

      mockPost.mockRejectedValue(error);

      await expect(createNoteHistory({} as never)).rejects.toThrow(error);
    });
  });

  describe('deleteNoteHistory', () => {
    it('deletes a note history record and returns data', async () => {
      const response = {
        noteHistoryId: 'note-history-1'
      };

      mockDelete.mockResolvedValue({
        data: response
      });

      const result = await deleteNoteHistory({
        noteHistoryId: 'note-history-1'
      });

      expect(mockDelete).toHaveBeenCalledWith('housing/note/note-history-1');

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');

      mockDelete.mockRejectedValue(error);

      await expect(
        deleteNoteHistory({
          noteHistoryId: 'note-history-1'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('listBringForwards', () => {
    it('returns bring forwards with filter params', async () => {
      const bringForwards = [{ id: '1' }, { id: '2' }];

      const request = {
        bringForwardState: 'OPEN'
      };

      mockGet.mockResolvedValue({
        data: bringForwards
      });

      const result = await listBringForwards(request as never);

      expect(mockGet).toHaveBeenCalledWith('housing/note/bringForward', {
        params: {
          bringForwardState: 'OPEN'
        }
      });

      expect(result).toEqual(bringForwards);
    });

    it('propagates errors', async () => {
      const error = new Error('list failed');

      mockGet.mockRejectedValue(error);

      await expect(
        listBringForwards({
          bringForwardState: 'OPEN'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('listNoteHistories', () => {
    it('returns note histories for an activity', async () => {
      const noteHistories = [{ noteHistoryId: '1' }, { noteHistoryId: '2' }];

      mockGet.mockResolvedValue({
        data: noteHistories
      });

      const result = await listNoteHistories({
        activityId: 'activity-1'
      });

      expect(mockGet).toHaveBeenCalledWith('housing/note/list/activity-1');

      expect(result).toEqual(noteHistories);
    });

    it('propagates errors', async () => {
      const error = new Error('list failed');

      mockGet.mockRejectedValue(error);

      await expect(
        listNoteHistories({
          activityId: 'activity-1'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('putNoteHistory', () => {
    it('updates a note history record and returns data', async () => {
      const request = {
        noteHistoryId: 'note-history-1',
        note: 'Updated note',
        bringForwardDate: '2026-01-01'
      };

      const response = {
        noteHistoryId: 'note-history-1',
        note: 'Updated note'
      };

      mockPut.mockResolvedValue({
        data: response
      });

      const result = await putNoteHistory(request as never);

      expect(mockPut).toHaveBeenCalledWith('housing/note/note-history-1', {
        note: 'Updated note',
        bringForwardDate: '2026-01-01'
      });

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('update failed');

      mockPut.mockRejectedValue(error);

      await expect(
        putNoteHistory({
          noteHistoryId: 'note-history-1'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(noteHistoryService).toEqual({
      createNoteHistory,
      deleteNoteHistory,
      listBringForwards,
      listNoteHistories,
      putNoteHistory
    });
  });
});
