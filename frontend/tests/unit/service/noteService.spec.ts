import { noteService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { BringForwardType } from '@/utils/enums/housing';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testNote = {
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

const deleteSpy = vi.fn();
const getSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  delete: deleteSpy,
  get: getSpy,
  put: putSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('noteService', () => {
  describe('createNote', () => {
    it('calls with given data', () => {
      noteService.createNote(testNote);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith('note', testNote);
    });
  });

  describe('deleteNote', () => {
    it('calls with given data', () => {
      noteService.deleteNote(testNote.noteId);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`note/${testNote.noteId}`);
    });
  });

  describe('listBringForward', () => {
    it('does not include state when given no parameter', () => {
      noteService.listBringForward();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/bringForward', { params: { bringForwardState: undefined } });
    });

    it('adds Unresolved to query when given as parameter', () => {
      noteService.listBringForward(BringForwardType.UNRESOLVED);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/bringForward', {
        params: { bringForwardState: BringForwardType.UNRESOLVED }
      });
    });

    it('adds Resolved to query when given as parameter', () => {
      noteService.listBringForward(BringForwardType.RESOLVED);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/bringForward', {
        params: { bringForwardState: BringForwardType.RESOLVED }
      });
    });
  });

  describe('listNotes', () => {
    it('retrieves note list', () => {
      noteService.listNotes('testUUID');

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/list/testUUID');
    });
  });

  describe('updateNote', () => {
    it('calls with given data', () => {
      noteService.updateNote(testNote);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`note/${testNote.noteId}`, testNote);
    });
  });
});
