import { setActivePinia, createPinia } from 'pinia';

import { accessRequestService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { AxiosInstance } from 'axios';
import type { StoreGeneric } from 'pinia';

// Constants
const PATH = 'accessRequest';

const TEST_ACCESS_REQUEST = {
  accessRequestId: 'req123',
  grant: true,
  group: 'DEVELOPER',
  status: 'pending',
  userId: 'user456'
};

const TEST_USER = {
  userId: 'user456',
  username: 'testuser',
  email: 'testuser@example.com'
};

const testUserAccessRequest = {
  accessRequest: TEST_ACCESS_REQUEST,
  user: TEST_USER
};

// Mocks
const getSpy = vi.fn();
const postSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  post: postSpy
} as unknown as AxiosInstance);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('accessRequestService', () => {
  let appStore: StoreGeneric;

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore = useAppStore();
        appStore.setInitiative(initiative);
      });

      it('calls createUserAccessRequest with correct data', () => {
        accessRequestService.createUserAccessRequest(testUserAccessRequest);

        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, testUserAccessRequest);
      });

      it('calls processUserAccessRequest with correct data', () => {
        accessRequestService.processUserAccessRequest(
          testUserAccessRequest.accessRequest.accessRequestId,
          testUserAccessRequest
        );

        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(
          `${initiative.toLowerCase()}/${PATH}/${testUserAccessRequest.accessRequest.accessRequestId}`,
          testUserAccessRequest
        );
      });

      it('calls getAccessRequests', () => {
        accessRequestService.getAccessRequests();

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`);
      });
    }
  );
});
