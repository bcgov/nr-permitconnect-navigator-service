import { mockReset } from 'vitest-mock-extended';

import { TEST_GROUP_1, TEST_GROUP_2_ADMIN, TEST_INITIATIVE_HOUSING, TEST_SUBJECT_GROUP_1 } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { isUserAdmin, removeUserGroups } from '../../../src/domains/accessRequest.ts';
import * as yarsDomain from '../../../src/domains/yars.ts';
import { GroupName, Initiative } from '../../../src/utils/enums/application.ts';

import type { Group } from '../../../src/types/index.ts';

vi.mock('../../../src/domains/yars.ts');

describe('accessRequest domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('isUserAdmin', () => {
    beforeEach(() => {
      // Override the initiativeId to match the groups in the test data
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        ...TEST_INITIATIVE_HOUSING,
        initiativeId: 'init-1'
      });
    });

    it('should return true when user has DEVELOPER group', async () => {
      const userGroups: Group[] = [{ ...TEST_GROUP_1, name: GroupName.DEVELOPER }];

      const result = await isUserAdmin(mockRepos, Initiative.HOUSING, userGroups);

      expect(result).toBe(true);
      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledWith({
        where: { code: Initiative.HOUSING }
      });
    });

    it('should return true when user has ADMIN group for the current initiative', async () => {
      const userGroups: Group[] = [TEST_GROUP_2_ADMIN];

      const result = await isUserAdmin(mockRepos, Initiative.HOUSING, userGroups);

      expect(result).toBe(true);
    });

    it('should return false when user has ADMIN group but for different initiative', async () => {
      const userGroups: Group[] = [
        {
          ...TEST_GROUP_2_ADMIN,
          initiativeCode: Initiative.GENERAL,
          initiativeId: 'init-2'
        }
      ];

      const result = await isUserAdmin(mockRepos, Initiative.HOUSING, userGroups);

      expect(result).toBe(false);
    });

    it('should return false when user has no relevant groups', async () => {
      const userGroups: Group[] = [TEST_GROUP_1];

      const result = await isUserAdmin(mockRepos, Initiative.HOUSING, userGroups);

      expect(result).toBe(false);
    });

    it('should return false when user has empty group list', async () => {
      const userGroups: Group[] = [];

      const result = await isUserAdmin(mockRepos, Initiative.HOUSING, userGroups);

      expect(result).toBe(false);
    });
  });

  describe('removeUserGroups', () => {
    beforeEach(() => {
      // Override the initiativeId to match the groups in the test data
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        ...TEST_INITIATIVE_HOUSING,
        initiativeId: 'init-1'
      });
      // Suppress type mismatch for Prisma properties not present in the test object
      mockRepos.subjectGroup.delete.mockResolvedValue(TEST_SUBJECT_GROUP_1);
    });

    it('should remove current initiative groups and return undefined when no primary found', async () => {
      const userGroups: Group[] = [TEST_GROUP_2_ADMIN];
      const globalGroup: Group = {
        ...TEST_GROUP_2_ADMIN,
        groupId: 5
      };

      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(false);
      vi.spyOn(yarsDomain, 'getCorrespondingGlobalGroup').mockResolvedValue(globalGroup);

      await removeUserGroups(mockRepos, 'test-sub', Initiative.HOUSING, userGroups);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledWith({
        sub_groupId: {
          sub: 'test-sub',
          groupId: 2
        }
      });
      expect(mockRepos.subjectGroup.subjectHasGroupName).toHaveBeenCalledWith('test-sub', GroupName.ADMIN);
    });

    it('should remove global groups if user has no remaining groups of that name', async () => {
      const userGroups: Group[] = [TEST_GROUP_2_ADMIN];
      const globalGroup: Group = {
        ...TEST_GROUP_2_ADMIN,
        groupId: 5,
        initiativeCode: Initiative.PCNS
      };

      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(false);
      vi.spyOn(yarsDomain, 'getCorrespondingGlobalGroup').mockResolvedValue(globalGroup);

      await removeUserGroups(mockRepos, 'test-sub', Initiative.HOUSING, userGroups);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledWith({
        sub_groupId: {
          sub: 'test-sub',
          groupId: 5
        }
      });
    });

    it('should not remove global groups if user still has groups of that name in other initiatives', async () => {
      const userGroups: Group[] = [TEST_GROUP_2_ADMIN];

      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(true);

      await removeUserGroups(mockRepos, 'test-sub', Initiative.HOUSING, userGroups);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledTimes(1);
      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledWith({
        sub_groupId: {
          sub: 'test-sub',
          groupId: 2
        }
      });
      expect(vi.mocked(yarsDomain.getCorrespondingGlobalGroup)).not.toHaveBeenCalled();
    });

    it('should handle multiple groups for current initiative', async () => {
      const userGroups: Group[] = [TEST_GROUP_2_ADMIN, TEST_GROUP_1];
      const globalGroup: Group = {
        ...TEST_GROUP_2_ADMIN,
        groupId: 5
      };

      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(false);
      vi.spyOn(yarsDomain, 'getCorrespondingGlobalGroup').mockResolvedValue(globalGroup);

      await removeUserGroups(mockRepos, 'test-sub', Initiative.HOUSING, userGroups);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledWith({
        sub_groupId: {
          sub: 'test-sub',
          groupId: TEST_GROUP_2_ADMIN.groupId
        }
      });
      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledWith({
        sub_groupId: {
          sub: 'test-sub',
          groupId: TEST_GROUP_1.groupId
        }
      });
    });

    it('should skip groups not in current initiative', async () => {
      const userGroups: Group[] = [
        TEST_GROUP_2_ADMIN,
        {
          ...TEST_GROUP_1,
          groupId: 4,
          initiativeCode: Initiative.GENERAL,
          initiativeId: 'init-2'
        }
      ];
      const globalGroup: Group = {
        ...TEST_GROUP_2_ADMIN,
        groupId: 5
      };

      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(false);
      vi.spyOn(yarsDomain, 'getCorrespondingGlobalGroup').mockResolvedValue(globalGroup);

      await removeUserGroups(mockRepos, 'test-sub', Initiative.HOUSING, userGroups);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledWith({
        sub_groupId: {
          sub: 'test-sub',
          groupId: 2
        }
      });
      expect(mockRepos.subjectGroup.delete).not.toHaveBeenCalledWith({
        sub_groupId: expect.objectContaining({ groupId: 4 })
      });
    });
  });
});
