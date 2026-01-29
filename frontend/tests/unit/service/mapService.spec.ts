import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import mapService from '@/services/mapService';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { AxiosInstance } from 'axios';

// Constants
const PATH = 'map';

const TEST_PROJECT_ID = 'project123';

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
} as unknown as AxiosInstance);

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
      mapService.getPIDs(TEST_PROJECT_ID);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/pids/${TEST_PROJECT_ID}`);
    });
  });
});
