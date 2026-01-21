import ssoService from '@/services/ssoService';
import { appAxios } from '@/services/interceptors';

import type { AxiosInstance } from 'axios';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testIdirObj = {
  firstName: 'John'
};

const testBceidObj = {
  guid: '1234'
};

const getSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy
} as unknown as AxiosInstance);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ssoService', () => {
  describe('searchIdirUsers', () => {
    it('calls with given data', () => {
      ssoService.searchIdirUsers(testIdirObj);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('sso/idir/users', { params: testIdirObj });
    });
  });

  describe('searchBasicBceidUsers', () => {
    it('calls with given data', () => {
      ssoService.searchBasicBceidUsers(testBceidObj);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('sso/basic-bceid/users', { params: testBceidObj });
    });
  });
});
