import { mockReset } from 'vitest-mock-extended';

import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { searchUsersService } from '../../../src/services/user.ts';
import { Initiative, GroupName } from '../../../src/utils/enums/application.ts';
import { TEST_IDIR_USER_1, TEST_GROUP_1, TEST_GROUP_2_ADMIN } from '../data/index.ts';

import type { UserSearchParameters } from '../../../src/types/stuff.ts';

vi.mock('config');

describe('user service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('searchUsersService', () => {
    it('returns users from search without group filtering when no group params provided', async () => {
      const users = [{ ...TEST_IDIR_USER_1 }];

      mockRepos.user.search.mockResolvedValue(users as never);

      const params: UserSearchParameters = {
        email: 'john@example.com'
      };

      const result = await searchUsersService(params);

      expect(mockRepos.user.search).toHaveBeenCalledWith(params);
      expect(result).toEqual(users);
    });

    it('includes user groups when includeUserGroups is true', async () => {
      const users = [{ ...TEST_IDIR_USER_1 }];
      const groups = [TEST_GROUP_1];

      mockRepos.user.search.mockResolvedValue(users as never);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue(groups as never);

      const params: UserSearchParameters = {
        includeUserGroups: true
      };

      const result = await searchUsersService(params);

      expect(mockRepos.user.search).toHaveBeenCalledWith(params);
      expect(mockRepos.subjectGroup.getSubjectGroups).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub);
      expect(result).toEqual([
        {
          ...TEST_IDIR_USER_1,
          groups
        }
      ]);
    });

    it('filters users by group names when provided', async () => {
      const user1 = { ...TEST_IDIR_USER_1 };
      const user2 = { ...TEST_IDIR_USER_1, userId: 'user-2', sub: 'sub-2' };
      const searchResults = [user1, user2];

      const navigatorGroup = TEST_GROUP_1;
      const adminGroup = TEST_GROUP_2_ADMIN;

      mockRepos.user.search.mockResolvedValue(searchResults as never);
      mockRepos.subjectGroup.getSubjectGroups
        .mockResolvedValueOnce([navigatorGroup] as never)
        .mockResolvedValueOnce([adminGroup] as never);

      const params: UserSearchParameters = {
        group: [GroupName.NAVIGATOR]
      };

      const result = await searchUsersService(params);

      expect(mockRepos.user.search).toHaveBeenCalledWith(params);
      expect(mockRepos.subjectGroup.getSubjectGroups).toHaveBeenCalledTimes(2);
      // Only user1 should be in result (has NAVIGATOR group, not ADMIN)
      expect(result).toEqual([user1]);
    });

    it('filters users by initiative when provided', async () => {
      const users = [{ ...TEST_IDIR_USER_1 }];
      const groups = [
        {
          ...TEST_GROUP_1,
          groupId: 1,
          initiativeId: 'init-1',
          initiativeCode: Initiative.HOUSING
        },
        {
          ...TEST_GROUP_1,
          groupId: 2,
          initiativeId: 'init-2',
          initiativeCode: Initiative.ELECTRIFICATION
        }
      ];

      mockRepos.user.search.mockResolvedValue(users as never);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue(groups as never);
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        initiativeId: 'init-1',
        code: Initiative.HOUSING,
        name: 'Housing',
        label: 'Housing Initiative',
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedBy: null,
        deletedAt: null
      } as never);

      const params: UserSearchParameters = {
        includeUserGroups: true,
        initiative: [Initiative.HOUSING]
      };

      const result = await searchUsersService(params);

      expect(mockRepos.user.search).toHaveBeenCalledWith(params);
      expect(mockRepos.subjectGroup.getSubjectGroups).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub);
      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledTimes(1);
      // User should be returned with only groups from HOUSING initiative
      expect(result).toEqual([
        {
          ...TEST_IDIR_USER_1,
          groups: [groups[0]]
        }
      ]);
    });

    it('excludes groups when includeUserGroups is not set even if groups were fetched', async () => {
      const users = [{ ...TEST_IDIR_USER_1 }];
      const groups = [TEST_GROUP_1];

      mockRepos.user.search.mockResolvedValue(users as never);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue(groups as never);

      const params: UserSearchParameters = {
        group: [GroupName.NAVIGATOR]
      };

      const result = await searchUsersService(params);

      expect(mockRepos.user.search).toHaveBeenCalledWith(params);
      expect(mockRepos.subjectGroup.getSubjectGroups).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub);
      // Groups should be fetched for filtering but not included in result
      expect(result).toEqual([{ ...TEST_IDIR_USER_1 }]);
    });

    it('handles users with no groups', async () => {
      const users = [{ ...TEST_IDIR_USER_1 }];

      mockRepos.user.search.mockResolvedValue(users as never);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([] as never);

      const params: UserSearchParameters = {
        includeUserGroups: true
      };

      const result = await searchUsersService(params);

      expect(mockRepos.subjectGroup.getSubjectGroups).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub);
      expect(result).toEqual([
        {
          ...TEST_IDIR_USER_1,
          groups: []
        }
      ]);
    });

    it('returns empty array when no users match search', async () => {
      mockRepos.user.search.mockResolvedValue([] as never);

      const params: UserSearchParameters = {
        email: 'nonexistent@example.com'
      };

      const result = await searchUsersService(params);

      expect(mockRepos.user.search).toHaveBeenCalledWith(params);
      expect(result).toEqual([]);
    });
  });
});
