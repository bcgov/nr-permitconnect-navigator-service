import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import permitNoteService from '@/services/permitNoteService';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { AxiosInstance } from 'axios';

// Constants
const PATH = 'permit/note';

const TEST_PERMIT_NOTE = {
  permitNoteId: 'note123',
  permitId: 'permit456',
  note: 'This is a test note.',
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
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
} as unknown as AxiosInstance);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('permitNoteService', () => {
  let appStore: StoreGeneric;

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore = useAppStore();
        appStore.setInitiative(initiative);
      });

      describe('createPermitNote', () => {
        it('calls with given data', () => {
          permitNoteService.createPermitNote(TEST_PERMIT_NOTE);

          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, TEST_PERMIT_NOTE);
        });
      });

      describe('deletePermitNote', () => {
        it('calls with given data', () => {
          permitNoteService.deletePermitNote(TEST_PERMIT_NOTE.permitNoteId);

          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(deleteSpy).toHaveBeenCalledWith(
            `${initiative.toLowerCase()}/${PATH}/${TEST_PERMIT_NOTE.permitNoteId}`
          );
        });
      });
    }
  );
});
