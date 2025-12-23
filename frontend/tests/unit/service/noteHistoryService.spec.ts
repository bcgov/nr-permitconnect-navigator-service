import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { noteHistoryService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { BringForwardType, NoteType } from '@/utils/enums/projectCommon';

import type { Note, NoteHistory } from '@/types';

// Constants
const PATH = 'note';

const TEST_NOTE: Note = {
  noteId: '123',
  noteHistoryId: '123',
  note: 'some text',
  createdBy: 'user',
  createdAt: new Date().toISOString(),
  updatedBy: 'user',
  updatedAt: new Date().toISOString()
};

const TEST_NOTE_HISTORY: NoteHistory = {
  activityId: '123',
  bringForwardDate: null,
  bringForwardState: null,
  escalateToDirector: false,
  escalateToSupervisor: false,
  escalationType: null,
  note: [TEST_NOTE],
  noteHistoryId: '123',
  type: NoteType.GENERAL,
  title: 'Title',
  shownToProponent: false,
  createdBy: 'user',
  createdAt: new Date().toISOString(),
  updatedBy: 'user',
  updatedAt: new Date().toISOString()
};

// Mocks
const deleteSpy = vi.fn();
const getSpy = vi.fn();
const postSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  delete: deleteSpy,
  get: getSpy,
  post: postSpy,
  put: putSpy
} as any);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('noteHistoryService', () => {
  let appStore: StoreGeneric;

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore = useAppStore();
        appStore.setInitiative(initiative);
      });

      describe('createNoteHistory', () => {
        it('calls with given data', () => {
          noteHistoryService.createNoteHistory({ ...TEST_NOTE_HISTORY, note: 'text' } as any);

          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, {
            ...TEST_NOTE_HISTORY,
            note: 'text'
          });
        });
      });

      describe('deleteNote', () => {
        it('calls with given data', () => {
          noteHistoryService.deleteNoteHistory(TEST_NOTE_HISTORY.noteHistoryId as string);

          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(deleteSpy).toHaveBeenCalledWith(
            `${initiative.toLowerCase()}/${PATH}/${TEST_NOTE_HISTORY.noteHistoryId}`
          );
        });
      });

      describe('listBringForward', () => {
        it('does not include state when given no parameter', () => {
          noteHistoryService.listBringForward();

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/bringForward`, {
            params: { bringForwardState: undefined }
          });
        });

        it('adds Unresolved to query when given as parameter', () => {
          noteHistoryService.listBringForward(BringForwardType.UNRESOLVED);

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/bringForward`, {
            params: { bringForwardState: BringForwardType.UNRESOLVED }
          });
        });

        it('adds Resolved to query when given as parameter', () => {
          noteHistoryService.listBringForward(BringForwardType.RESOLVED);

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/bringForward`, {
            params: { bringForwardState: BringForwardType.RESOLVED }
          });
        });
      });

      describe('listNotes', () => {
        it('retrieves note list', () => {
          noteHistoryService.listNoteHistories('testUUID');

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/list/testUUID`);
        });
      });

      describe('updateNote', () => {
        it('calls with given data', () => {
          noteHistoryService.updateNoteHistory(
            TEST_NOTE_HISTORY.noteHistoryId as string,
            { ...TEST_NOTE_HISTORY, note: 'text' } as any
          );

          expect(putSpy).toHaveBeenCalledTimes(1);
          expect(putSpy).toHaveBeenCalledWith(
            `${initiative.toLowerCase()}/${PATH}/${TEST_NOTE_HISTORY.noteHistoryId}`,
            { ...TEST_NOTE_HISTORY, note: 'text' }
          );
        });
      });
    }
  );
});
