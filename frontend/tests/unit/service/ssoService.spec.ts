import ssoService from '@/services/ssoService';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testObj = {
  firstName: 'John'
};

const getSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ssoService', () => {
  describe('searchIdirUsers', () => {
    it('calls with given data', () => {
      ssoService.searchIdirUsers(testObj);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('sso/idir/users', { params: testObj });
    });
  });

  describe('searchBasicBceidUsers', () => {
    it('calls with given data', () => {
      ssoService.searchBasicBceidUsers(testObj);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('sso/basic-bceid/users', { params: testObj });
    });
  });
});
