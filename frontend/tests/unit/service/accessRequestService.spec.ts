import { accessRequestService } from '@/services';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const PATH = 'accessRequest';

const testAccessRequest = {
  accessRequestId: 'req123',
  grant: true,
  group: 'DEVELOPER',
  status: 'pending',
  userId: 'user456'
};

// Sample User object
const testUser = {
  userId: 'user456',
  username: 'testuser',
  email: 'testuser@example.com'
};

// Sample UserAccessRequest object
const testUserAccessRequest = {
  accessRequest: testAccessRequest,
  user: testUser
};

const getSpy = vi.fn();
const postSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  post: postSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('accessRequestService', () => {
  it('calls createUserAccessRequest with correct data', () => {
    accessRequestService.createUserAccessRequest(testUserAccessRequest);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(`${PATH}/`, testUserAccessRequest);
  });

  it('calls processUserAccessRequest with correct data', () => {
    accessRequestService.processUserAccessRequest(
      testUserAccessRequest.accessRequest.accessRequestId,
      testUserAccessRequest
    );

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      `${PATH}/${testUserAccessRequest.accessRequest.accessRequestId}`,
      testUserAccessRequest
    );
  });

  it('calls getAccessRequests', () => {
    accessRequestService.getAccessRequests();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}`);
  });
});
