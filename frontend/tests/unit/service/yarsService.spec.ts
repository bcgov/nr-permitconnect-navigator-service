import { appAxios } from '@/services/interceptors';
import yarsService from '@/services/yarsService';
import { Initiative } from '@/utils/enums/application';

import type { AxiosInstance } from 'axios';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testObj = {
  sub: 'foobar',
  groupId: 1
};

const getSpy = vi.fn();
const deleteSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  delete: deleteSpy
} as unknown as AxiosInstance);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('yarsService', () => {
  describe('getGroups', () => {
    it('calls with given data', () => {
      yarsService.getGroups(Initiative.HOUSING);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('yars/groups', { params: { initiative: Initiative.HOUSING } });
    });
  });

  describe('getPermissions', () => {
    it('calls with given data', () => {
      yarsService.getPermissions();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('yars/permissions');
    });
  });

  describe('deleteSubjectGroup', () => {
    it('calls with given data', () => {
      yarsService.deleteSubjectGroup(testObj.sub, testObj.groupId);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith('yars/subject/group', { data: testObj });
    });
  });
});
