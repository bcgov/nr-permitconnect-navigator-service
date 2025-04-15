import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import mapService from '@/services/mapService';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

// Constants
const PATH = 'map';

const TEST_SUBMISSION_ID = 'submission123';

// Mocks
const getSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy
} as any);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('mapService', () => {
  let appStore: StoreGeneric;

  beforeEach(() => {
    appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);
  });

  describe('getPIDs', () => {
    it('calls with given data', () => {
      mapService.getPIDs(TEST_SUBMISSION_ID);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/pids/${TEST_SUBMISSION_ID}`);
    });
  });
});
