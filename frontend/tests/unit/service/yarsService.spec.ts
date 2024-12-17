import { appAxios } from '@/services/interceptors';
import yarsService from '@/services/yarsService';
import { GroupName } from '@/utils/enums/application';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testObj = {
  sub: 'foobar',
  group: GroupName.DEVELOPER
};

const getSpy = vi.fn();
const deleteSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  delete: deleteSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('yarsService', () => {
  describe('getGroups', () => {
    it('calls with given data', () => {
      yarsService.getGroups();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('yars/groups');
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
      yarsService.deleteSubjectGroup(testObj);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith('yars/subject/group', { data: testObj });
    });
  });
});
