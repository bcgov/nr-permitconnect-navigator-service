import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { noteService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { BringForwardType } from '@/utils/enums/projectCommon';

// Constants
const PATH = 'note';

const TEST_NOTE = {
  noteId: 'noteUUID',
  activityId: 'activityUUID',
  note: 'note contents text',
  noteType: 'Note Type',
  title: 'note contents title',
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString(),
  isDeleted: false
};

// Mocks
const deleteSpy = vi.fn();
const getSpy = vi.fn();
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
  put: putSpy
} as any);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('noteService', () => {
  let appStore: StoreGeneric;

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore = useAppStore();
        appStore.setInitiative(initiative);
      });

      describe('createNote', () => {
        it('calls with given data', () => {
          noteService.createNote(TEST_NOTE);

          expect(putSpy).toHaveBeenCalledTimes(1);
          expect(putSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, TEST_NOTE);
        });
      });

      describe('deleteNote', () => {
        it('calls with given data', () => {
          noteService.deleteNote(TEST_NOTE.noteId);

          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(deleteSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${TEST_NOTE.noteId}`);
        });
      });

      describe('listBringForward', () => {
        it('does not include state when given no parameter', () => {
          noteService.listBringForward();

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/bringForward`, {
            params: { bringForwardState: undefined }
          });
        });

        it('adds Unresolved to query when given as parameter', () => {
          noteService.listBringForward(BringForwardType.UNRESOLVED);

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/bringForward`, {
            params: { bringForwardState: BringForwardType.UNRESOLVED }
          });
        });

        it('adds Resolved to query when given as parameter', () => {
          noteService.listBringForward(BringForwardType.RESOLVED);

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/bringForward`, {
            params: { bringForwardState: BringForwardType.RESOLVED }
          });
        });
      });

      describe('listNotes', () => {
        it('retrieves note list', () => {
          noteService.listNotes('testUUID');

          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/list/testUUID`);
        });
      });

      describe('updateNote', () => {
        it('calls with given data', () => {
          noteService.updateNote(TEST_NOTE);

          expect(putSpy).toHaveBeenCalledTimes(1);
          expect(putSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${TEST_NOTE.noteId}`, TEST_NOTE);
        });
      });
    }
  );
});
