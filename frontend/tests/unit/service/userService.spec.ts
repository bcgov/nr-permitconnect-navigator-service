import { userService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { SYSTEM_USER } from '@/utils/constants';

import type { AxiosResponse } from 'axios';
import type { UserSearchParameters } from '@/types/UserSearchParameters';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

const getSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('userService test', () => {
  it('searches for user with valid object with all values', async () => {
    const testSearchParam: UserSearchParameters = {
      userId: ['testUserId1', 'testUserId2'],
      identityId: ['testIdentityId1'],
      idp: ['idp1', 'idp2'],
      username: 'testUserName',
      email: 'testEmail@test.com',
      firstName: 'testFirst',
      fullName: 'testFull',
      lastName: 'testLast',
      active: true
    };
    await userService.searchUsers(testSearchParam);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('user', { params: testSearchParam });
  });

  it('filters out duplicate userIds', async () => {
    const searchParams: UserSearchParameters = {
      userId: ['testUserId1', 'testUserId2', 'duplicateId', 'duplicateId', 'testUserId2']
    };
    const expectedCall: UserSearchParameters = {
      userId: ['testUserId1', 'testUserId2', 'duplicateId']
    };
    await userService.searchUsers(searchParams);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('user', { params: expectedCall });
  });

  it('filters out syster userId', async () => {
    const searchParams: UserSearchParameters = {
      userId: ['testUserId1', SYSTEM_USER, 'testUserId2']
    };
    const expectedCall: UserSearchParameters = {
      userId: ['testUserId1', 'testUserId2']
    };
    await userService.searchUsers(searchParams);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('user', { params: expectedCall });
  });

  it('does not call with userId in params if userId array is empty', async () => {
    const searchParams: UserSearchParameters = {
      userId: [],
      active: true
    };
    const expectedCall: UserSearchParameters = {
      active: true
    };
    await userService.searchUsers(searchParams);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('user', { params: expectedCall });
  });

  it('returns empty data if no params', async () => {
    const searchParams: UserSearchParameters = {};
    const result = await userService.searchUsers(searchParams);
    expect(getSpy).not.toHaveBeenCalled();
    expect(result).toMatchObject({ data: [] } as AxiosResponse);
  });
});
