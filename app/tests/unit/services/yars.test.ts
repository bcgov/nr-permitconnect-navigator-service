import { mockReset } from 'vitest-mock-extended';

import { TEST_CURRENT_CONTEXT, TEST_GROUP_1, TEST_IDIR_USER_1 } from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import * as yarsDomain from '#src/domains/yars';
import * as comsExternal from '#src/external/coms';
import {
  deleteSubjectGroupService,
  getGroupsService,
  listPermissionsService,
  listSubjectPermissionsService
} from '#src/services/yars';
import { GroupName, Initiative } from '#src/utils/enums/application';
import Problem from '#src/utils/problem';

import type { JwtPayload } from 'jsonwebtoken';
import type { CurrentContext } from '#types';

vi.mock('config');

const getGroupsSpy = vi.spyOn(yarsDomain, 'getGroups');
const getCorrespondingGlobalGroupSpy = vi.spyOn(yarsDomain, 'getCorrespondingGlobalGroup');
const assignPermissionsSpy = vi.spyOn(comsExternal, 'assignPermissions');

describe('yars service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('getGroupsService', () => {
    it('delegates to domain getGroups with initiative code', async () => {
      const groups = [
        {
          initiativeCode: Initiative.HOUSING,
          groupId: TEST_GROUP_1.groupId,
          initiativeId: TEST_GROUP_1.initiativeId,
          name: TEST_GROUP_1.name,
          label: TEST_GROUP_1.label!
        }
      ];

      getGroupsSpy.mockResolvedValue(groups as never);

      const result = await getGroupsService(Initiative.HOUSING);

      expect(getGroupsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          group: mockRepos.group,
          initiative: mockRepos.initiative
        }),
        Initiative.HOUSING
      );
      expect(result).toEqual(groups);
    });

    it('delegates to domain getGroups with undefined initiative', async () => {
      const groups = [
        {
          initiativeCode: Initiative.HOUSING,
          groupId: TEST_GROUP_1.groupId,
          initiativeId: TEST_GROUP_1.initiativeId,
          name: TEST_GROUP_1.name,
          label: TEST_GROUP_1.label!
        }
      ];

      getGroupsSpy.mockResolvedValue(groups as never);

      const result = await getGroupsService(undefined);

      expect(getGroupsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          group: mockRepos.group,
          initiative: mockRepos.initiative
        }),
        undefined
      );
      expect(result).toEqual(groups);
    });

    it('returns empty array when no groups exist', async () => {
      getGroupsSpy.mockResolvedValue([] as never);

      const result = await getGroupsService(Initiative.HOUSING);

      expect(result).toEqual([]);
    });
  });

  describe('listPermissionsService', () => {
    it('returns groups and their permissions for given initiative and group name', async () => {
      const initiative = {
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
      };

      const groups = [TEST_GROUP_1];

      const permissions = [
        {
          rowNumber: BigInt(1),
          groupId: TEST_GROUP_1.groupId,
          initiativeCode: Initiative.HOUSING,
          groupName: GroupName.NAVIGATOR,
          roleName: 'role-1',
          policyId: 1,
          resourceName: 'resource-1',
          actionName: 'action-1',
          attributeName: null
        }
      ];

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(initiative as never);
      mockRepos.group.findMany.mockResolvedValue(groups as never);
      mockRepos.groupRolePolicyVw.getGroupPermissions.mockResolvedValue(permissions as never);

      const result = await listPermissionsService(Initiative.HOUSING, GroupName.NAVIGATOR);

      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledWith({
        where: { code: Initiative.HOUSING }
      });
      expect(mockRepos.group.findMany).toHaveBeenCalledWith({
        where: {
          initiativeId: initiative.initiativeId,
          name: GroupName.NAVIGATOR
        }
      });
      expect(mockRepos.groupRolePolicyVw.getGroupPermissions).toHaveBeenCalledWith(TEST_GROUP_1.groupId);
      expect(result).toEqual({
        groups: [
          {
            initiativeCode: Initiative.HOUSING,
            groupId: TEST_GROUP_1.groupId,
            initiativeId: TEST_GROUP_1.initiativeId,
            name: GroupName.NAVIGATOR,
            label: TEST_GROUP_1.label
          }
        ],
        permissions
      });
    });

    it('handles empty results when no matching group names found', async () => {
      const initiative = {
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
      };

      mockRepos.initiative.findFirstOrThrow.mockResolvedValue(initiative as never);
      mockRepos.group.findMany.mockResolvedValue([] as never);

      const result = await listPermissionsService(Initiative.HOUSING, GroupName.ADMIN);

      expect(mockRepos.group.findMany).toHaveBeenCalledWith({
        where: {
          initiativeId: initiative.initiativeId,
          name: GroupName.ADMIN
        }
      });
      expect(result.groups).toHaveLength(0);
      expect(result.permissions).toEqual([]);
    });
  });

  describe('listSubjectPermissionsService', () => {
    it('returns groups and permissions for current subject', async () => {
      const groups = [TEST_GROUP_1];
      const permissions = [
        {
          rowNumber: BigInt(1),
          groupId: TEST_GROUP_1.groupId,
          policyId: 1
        }
      ];

      const currentContext: CurrentContext = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: {
          ...TEST_CURRENT_CONTEXT.tokenPayload,
          sub: TEST_IDIR_USER_1.sub,
          identity_provider: 'bceid'
        } as JwtPayload
      };

      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue(groups as never);
      mockRepos.groupRolePolicyVw.getGroupPermissions.mockResolvedValue(permissions as never);
      assignPermissionsSpy.mockResolvedValue(undefined as never);

      const result = await listSubjectPermissionsService(currentContext);

      expect(mockRepos.subjectGroup.getSubjectGroups).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub);
      expect(mockRepos.groupRolePolicyVw.getGroupPermissions).toHaveBeenCalledWith(TEST_GROUP_1.groupId);
      expect(assignPermissionsSpy).toHaveBeenCalledWith(currentContext, TEST_IDIR_USER_1.sub, groups);
      expect(result).toEqual({
        groups,
        permissions
      });
    });

    it('throws error if tokenPayload.sub is missing', async () => {
      const currentContext: CurrentContext = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: {
          ...TEST_CURRENT_CONTEXT.tokenPayload,
          sub: undefined,
          identity_provider: 'bceid'
        } as JwtPayload
      };

      await expect(listSubjectPermissionsService(currentContext)).rejects.toThrow(
        new Problem(500, { detail: 'Unable to read token sub' })
      );
    });

    it('still returns permissions even if assignPermissions call fails', async () => {
      const groups = [TEST_GROUP_1];
      const permissions = [{ rowNumber: BigInt(1), groupId: TEST_GROUP_1.groupId, policyId: 1 }];

      const currentContext: CurrentContext = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: {
          ...TEST_CURRENT_CONTEXT.tokenPayload,
          sub: TEST_IDIR_USER_1.sub,
          identity_provider: 'bceid'
        } as JwtPayload
      };

      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue(groups as never);
      mockRepos.groupRolePolicyVw.getGroupPermissions.mockResolvedValue(permissions as never);
      assignPermissionsSpy.mockRejectedValue(new Error('COMS error'));

      const result = await listSubjectPermissionsService(currentContext);

      expect(result).toBeDefined();
      expect(result.groups).toEqual(groups);
      expect(result.permissions).toEqual(permissions);
    });
  });

  describe('deleteSubjectGroupService', () => {
    it('deletes group assignment and corresponding global group if no other groups with same name exist', async () => {
      const currentContext: Partial<CurrentContext> = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: {
          ...TEST_CURRENT_CONTEXT.tokenPayload,
          sub: TEST_IDIR_USER_1.sub,
          identity_provider: 'bceid'
        }
      };

      const groups = [TEST_GROUP_1];
      const globalGroup = {
        groupId: 100,
        initiativeId: 'init-global',
        initiativeCode: Initiative.PCNS,
        name: GroupName.NAVIGATOR,
        label: 'Global Navigator',
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedBy: null,
        deletedAt: null
      };

      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce(groups as never).mockResolvedValueOnce([] as never);
      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(false as never);
      mockRepos.subjectGroup.delete.mockResolvedValue({} as never);
      getCorrespondingGlobalGroupSpy.mockResolvedValue(globalGroup as never);
      assignPermissionsSpy.mockResolvedValue(undefined as never);

      await deleteSubjectGroupService(currentContext as CurrentContext, TEST_IDIR_USER_1.sub, TEST_GROUP_1.groupId);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledTimes(2);
      expect(mockRepos.subjectGroup.delete).toHaveBeenNthCalledWith(1, {
        sub_groupId: {
          sub: TEST_IDIR_USER_1.sub,
          groupId: TEST_GROUP_1.groupId
        }
      });
      expect(mockRepos.subjectGroup.delete).toHaveBeenNthCalledWith(2, {
        sub_groupId: {
          sub: TEST_IDIR_USER_1.sub,
          groupId: globalGroup.groupId
        }
      });
      expect(assignPermissionsSpy).toHaveBeenCalled();
    });

    it('throws error when trying to delete PCNS global group', async () => {
      const currentContext: Partial<CurrentContext> = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: {
          ...TEST_CURRENT_CONTEXT.tokenPayload,
          sub: TEST_IDIR_USER_1.sub,
          identity_provider: 'bceid'
        }
      };

      const globalGroup = {
        groupId: 1,
        initiativeId: 'init-global',
        initiativeCode: Initiative.PCNS,
        name: GroupName.ADMIN,
        label: 'Global Admin',
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedBy: null,
        deletedAt: null
      };

      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([globalGroup] as never);

      await expect(
        deleteSubjectGroupService(currentContext as CurrentContext, TEST_IDIR_USER_1.sub, 1)
      ).rejects.toThrow(new Problem(422, { detail: 'Cannot delete a global group directly' }));
    });

    it('skips global group deletion if user still has groups with same name in other initiatives', async () => {
      const currentContext: Partial<CurrentContext> = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: {
          ...TEST_CURRENT_CONTEXT.tokenPayload,
          sub: TEST_IDIR_USER_1.sub,
          identity_provider: 'bceid'
        }
      };

      const groups = [TEST_GROUP_1];

      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce(groups as never);
      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(true as never);
      mockRepos.subjectGroup.delete.mockResolvedValue({} as never);
      assignPermissionsSpy.mockResolvedValue(undefined as never);

      await deleteSubjectGroupService(currentContext as CurrentContext, TEST_IDIR_USER_1.sub, TEST_GROUP_1.groupId);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledTimes(1);
      expect(getCorrespondingGlobalGroupSpy).not.toHaveBeenCalled();
    });

    it('handles COMS assignPermissions error gracefully', async () => {
      const currentContext: Partial<CurrentContext> = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: {
          ...TEST_CURRENT_CONTEXT.tokenPayload,
          sub: TEST_IDIR_USER_1.sub,
          identity_provider: 'bceid'
        }
      };

      const groups = [TEST_GROUP_1];

      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce(groups as never).mockResolvedValueOnce([] as never);
      mockRepos.subjectGroup.subjectHasGroupName.mockResolvedValue(false as never);
      mockRepos.subjectGroup.delete.mockResolvedValue({} as never);
      getCorrespondingGlobalGroupSpy.mockResolvedValue({
        groupId: 100,
        initiativeId: 'init-global',
        initiativeCode: Initiative.PCNS,
        name: GroupName.NAVIGATOR,
        label: 'Global Navigator',
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedBy: null,
        deletedAt: null
      } as never);

      assignPermissionsSpy.mockRejectedValue(new Error('COMS error'));

      await deleteSubjectGroupService(currentContext as CurrentContext, TEST_IDIR_USER_1.sub, TEST_GROUP_1.groupId);

      expect(mockRepos.subjectGroup.delete).toHaveBeenCalledTimes(2);
    });
  });
});
