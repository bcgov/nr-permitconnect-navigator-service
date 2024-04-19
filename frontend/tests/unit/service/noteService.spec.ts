import { noteService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { BRING_FORWARD_TYPES } from '@/utils/enums';

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

const getSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  put: putSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('noteService', () => {
  describe('createNote', () => {
    it('calls with given data', async () => {
      await noteService.createNote(testNote);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith('note', testNote);
    });
  });

  describe('listBringForward', () => {
    it('does not include state when given no parameter', async () => {
      await noteService.listBringForward();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/bringForward', { params: { bringForwardState: undefined } });
    });

    it('adds Unresolved to query when given as parameter', async () => {
      await noteService.listBringForward(BRING_FORWARD_TYPES.UNRESOLVED);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/bringForward', {
        params: { bringForwardState: BRING_FORWARD_TYPES.UNRESOLVED }
      });
    });

    it('adds Resolved to query when given as parameter', async () => {
      await noteService.listBringForward(BRING_FORWARD_TYPES.RESOLVED);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/bringForward', {
        params: { bringForwardState: BRING_FORWARD_TYPES.RESOLVED }
      });
    });
  });

  describe('listNotes', () => {
    it('retrieves note list', async () => {
      await noteService.listNotes('testUUID');

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('note/list/testUUID');
    });
  });
});
