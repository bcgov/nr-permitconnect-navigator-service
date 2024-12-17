import permitNoteService from '@/services/permitNoteService';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testPermitNote = {
  permitNoteId: 'note123',
  permitId: 'permit456',
  note: 'This is a test note.',
  isDeleted: false,
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
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

describe('permitNoteService', () => {
  describe('createPermitNote', () => {
    it('calls with given data', () => {
      permitNoteService.createPermitNote(testPermitNote);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith('permit/note', testPermitNote);
    });
  });

  describe('deletePermitNote', () => {
    it('calls with given data', () => {
      permitNoteService.deletePermitNote(testPermitNote.permitNoteId);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`permit/note/${testPermitNote.permitNoteId}`);
    });
  });

  describe('updatePermitNote', () => {
    it('calls with given data', () => {
      permitNoteService.updatePermit(testPermitNote);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`permit/note/${testPermitNote.permitNoteId}`, testPermitNote);
    });
  });
});
