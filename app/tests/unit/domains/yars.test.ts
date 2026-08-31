import { mockReset } from 'vitest-mock-extended';

import { TEST_IDIR_USER_1 } from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { assignGroup, getCorrespondingGlobalGroup, getGroups } from '#src/domains/yars';
import { GroupName, Initiative } from '#src/utils/enums/application';

describe('yars domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('assignGroup', () => {
    it('should return existing group assignment when group already assigned', async () => {
      mockRepos.subjectGroup.subjectHasGroup.mockResolvedValue(true as never);

      const result = await assignGroup(mockRepos, TEST_IDIR_USER_1.sub, 123);

      expect(result).toEqual({
        sub: TEST_IDIR_USER_1.sub,
        roleId: 123
      });
      expect(mockRepos.subjectGroup.subjectHasGroup).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub, 123);
      expect(mockRepos.group.findFirstOrThrow).not.toHaveBeenCalled();
      expect(mockRepos.subjectGroup.create).not.toHaveBeenCalled();
    });

    it('should create new group assignment when group not already assigned', async () => {
      const newGroupAssignment = {
        sub: TEST_IDIR_USER_1.sub,
        groupId: 123
      };

      const groupData = {
        groupId: 123,
        name: GroupName.NAVIGATOR,
        label: 'Navigator',
        initiativeId: 'init-123'
      };

      mockRepos.subjectGroup.subjectHasGroup.mockResolvedValue(false as never);
      mockRepos.group.findFirstOrThrow.mockResolvedValue(groupData as never);
      mockRepos.subjectGroup.create.mockResolvedValue(newGroupAssignment as never);

      const result = await assignGroup(mockRepos, TEST_IDIR_USER_1.sub, 123);

      expect(result).toEqual({
        sub: TEST_IDIR_USER_1.sub,
        roleId: 123
      });
      expect(mockRepos.subjectGroup.subjectHasGroup).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub, 123);
      expect(mockRepos.group.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          groupId: 123
        }
      });
      expect(mockRepos.subjectGroup.create).toHaveBeenCalledWith({
        sub: TEST_IDIR_USER_1.sub,
        groupId: 123
      });
    });

    it('should pass through the correct groupId from created subjectGroup', async () => {
      const newGroupAssignment = {
        sub: 'user-sub-456',
        groupId: 456
      };

      const groupData = {
        groupId: 456,
        name: 'REVIEWER' as unknown as GroupName,
        label: 'Reviewer',
        initiativeId: 'init-456'
      };

      mockRepos.subjectGroup.subjectHasGroup.mockResolvedValue(false as never);
      mockRepos.group.findFirstOrThrow.mockResolvedValue(groupData as never);
      mockRepos.subjectGroup.create.mockResolvedValue(newGroupAssignment as never);

      const result = await assignGroup(mockRepos, 'user-sub-456', 456);

      expect(result.roleId).toBe(456);
    });
  });

  describe('getCorrespondingGlobalGroup', () => {
    it('should find and return corresponding global group by groupId', async () => {
      const localGroup = {
        groupId: 123,
        name: GroupName.NAVIGATOR,
        label: 'Navigator',
        initiativeId: 'init-local'
      };

      const pcnsInitiative = {
        initiativeId: 'init-pcns',
        code: Initiative.PCNS,
        label: 'PCNS Global'
      };

      const globalGroup = {
        groupId: 999,
        name: GroupName.NAVIGATOR,
        label: 'Navigator',
        initiativeId: pcnsInitiative.initiativeId
      };

      mockRepos.group.findFirstOrThrow
        .mockResolvedValueOnce(localGroup as never)
        .mockResolvedValueOnce(globalGroup as never);

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(pcnsInitiative as never);

      const result = await getCorrespondingGlobalGroup(mockRepos, 123);

      expect(result).toEqual({
        initiativeCode: Initiative.PCNS,
        initiativeId: pcnsInitiative.initiativeId,
        groupId: globalGroup.groupId,
        name: GroupName.NAVIGATOR,
        label: 'Navigator'
      });
      expect(mockRepos.group.findFirstOrThrow).toHaveBeenCalledTimes(2);
      expect(mockRepos.group.findFirstOrThrow).toHaveBeenNthCalledWith(1, {
        where: { groupId: 123 }
      });
      expect(mockRepos.group.findFirstOrThrow).toHaveBeenNthCalledWith(2, {
        where: {
          initiativeId: pcnsInitiative.initiativeId,
          name: GroupName.NAVIGATOR
        }
      });
      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledWith({
        where: { code: Initiative.PCNS }
      });
    });

    it('should fetch PCNS initiative once to find global group', async () => {
      const localGroup = {
        groupId: 456,
        name: 'REVIEWER' as unknown as GroupName,
        label: 'Reviewer',
        initiativeId: 'init-housing'
      };

      const pcnsInitiative = {
        initiativeId: 'init-pcns-global',
        code: Initiative.PCNS,
        label: 'PCNS'
      };

      const globalGroup = {
        groupId: 888,
        name: 'REVIEWER' as unknown as GroupName,
        label: 'Reviewer',
        initiativeId: pcnsInitiative.initiativeId
      };

      mockRepos.group.findFirstOrThrow
        .mockResolvedValueOnce(localGroup as never)
        .mockResolvedValueOnce(globalGroup as never);

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(pcnsInitiative as never);

      await getCorrespondingGlobalGroup(mockRepos, 456);

      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledOnce();
    });
  });

  describe('getGroups', () => {
    it('should get all groups for given initiative', async () => {
      const initiative = {
        initiativeId: 'init-housing',
        code: Initiative.HOUSING,
        label: 'Housing'
      };

      const groupsData = [
        {
          groupId: 1,
          name: GroupName.NAVIGATOR,
          label: 'Navigator',
          initiativeId: initiative.initiativeId
        },
        {
          groupId: 2,
          name: 'REVIEWER' as unknown as GroupName,
          label: 'Reviewer',
          initiativeId: initiative.initiativeId
        },
        {
          groupId: 3,
          name: 'DIRECTOR' as unknown as GroupName,
          label: 'Director',
          initiativeId: initiative.initiativeId
        }
      ];

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(initiative as never);
      mockRepos.group.findMany.mockResolvedValue(groupsData as never);

      const result = await getGroups(mockRepos, Initiative.HOUSING);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        initiativeCode: Initiative.HOUSING,
        groupId: 1,
        initiativeId: initiative.initiativeId,
        name: GroupName.NAVIGATOR,
        label: 'Navigator'
      });
      expect(result[1]).toEqual({
        initiativeCode: Initiative.HOUSING,
        groupId: 2,
        initiativeId: initiative.initiativeId,
        name: 'REVIEWER' as unknown as GroupName,
        label: 'Reviewer'
      });
      expect(result[2]).toEqual({
        initiativeCode: Initiative.HOUSING,
        groupId: 3,
        initiativeId: initiative.initiativeId,
        name: 'DIRECTOR' as unknown as GroupName,
        label: 'Director'
      });
      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledWith({
        where: { code: Initiative.HOUSING }
      });
      expect(mockRepos.group.findMany).toHaveBeenCalledWith({
        where: { initiativeId: initiative.initiativeId }
      });
    });

    it('should handle empty group list for initiative', async () => {
      const initiative = {
        initiativeId: 'init-empty',
        code: Initiative.ELECTRIFICATION,
        label: 'Electrification'
      };

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(initiative as never);
      mockRepos.group.findMany.mockResolvedValue([] as never);

      const result = await getGroups(mockRepos, Initiative.ELECTRIFICATION);

      expect(result).toEqual([]);
    });

    it('should return groups with correct initiative code for each', async () => {
      const initiative = {
        initiativeId: 'init-general',
        code: Initiative.GENERAL,
        label: 'General'
      };

      const groupsData = [
        {
          groupId: 100,
          name: GroupName.NAVIGATOR,
          label: 'Navigator',
          initiativeId: initiative.initiativeId
        }
      ];

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(initiative as never);
      mockRepos.group.findMany.mockResolvedValue(groupsData as never);

      const result = await getGroups(mockRepos, Initiative.GENERAL);

      expect(result[0].initiativeCode).toBe(Initiative.GENERAL);
      expect(result[0].groupId).toBe(100);
    });

    it('should work with undefined initiative code', async () => {
      const initiative = {
        initiativeId: 'init-pcns',
        code: Initiative.PCNS,
        label: 'PCNS'
      };

      const groupsData = [
        {
          groupId: 1,
          name: GroupName.NAVIGATOR,
          label: 'Navigator',
          initiativeId: initiative.initiativeId
        }
      ];

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(initiative as never);
      mockRepos.group.findMany.mockResolvedValue(groupsData as never);

      const result = await getGroups(mockRepos, undefined);

      expect(result).toHaveLength(1);
      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledWith({
        where: { code: undefined }
      });
    });
  });
});
