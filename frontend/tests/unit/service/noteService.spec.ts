import { noteService } from '@/services';
import { appAxios } from '@/services/interceptors';

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
  updatedAt: new Date().toISOString()
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

describe('noteService test', () => {
  it('creates a note', async () => {
    await noteService.createNote(testNote);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith('note', testNote);
  });

  it('retrieves bring forward list', async () => {
    await noteService.listBringForward();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('note/bringForward');
  });

  it('retrieves note list', async () => {
    await noteService.listNotes('testUUID');

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('note/list/testUUID');
  });
});
