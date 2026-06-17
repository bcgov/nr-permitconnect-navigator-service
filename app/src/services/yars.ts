import { assignPermissions } from './coms.ts';
import { unitOfWork } from '../repository/uow.ts';
import { Initiative, GroupName } from '../utils/enums/application.ts';
import { getLogger } from '../utils/log.ts';
import Problem from '../utils/problem.ts';

import type { CurrentContext, Group } from '../types/index.ts';
import { assignGroup, getCorrespondingGlobalGroup, getGroups } from './helpers/yars.ts';

const log = getLogger(module.filename);

/**
 * Assigns an identity to the given group
 * Assigns permissions to COMS based on the given group
 * @param sub Subject of the authorized user
 * @param groupId The group ID to add the user to
 * @returns A Promise that resolve to an object with a subject and role id
 */
export const assignGroupService = async (sub: string, groupId: number): Promise<{ sub: string; roleId: number }> => {
  return await unitOfWork.execute(async ({ group, subjectGroup }) => {
    return await assignGroup({ group, subjectGroup }, sub, groupId);
  });
};

export const getCorrespondingGlobalGroupService = async (groupId: number): Promise<Group> => {
  return unitOfWork.execute(async (repos) => {
    return getCorrespondingGlobalGroup(repos, groupId);
  });
};

/**
 * Gets a list of groups for the given initiativeId
 * @param initiativeCode Initiative code to search
 * @returns A Promise that resolves to an array of groups
 */
export const getGroupsService = async (initiativeCode: Initiative | undefined) => {
  return await unitOfWork.execute(async ({ group, initiative }) => {
    return await getGroups({ group, initiative }, initiativeCode);
  });
};

export const listPermissionsService = async (initiativeCode: Initiative, groupName: GroupName) => {
  return await unitOfWork.execute(async ({ group, groupRolePolicyVw, initiative }) => {
    const i = await initiative.findFirstOrThrow({
      where: {
        code: initiativeCode
      }
    });

    const groups = await group.findMany({
      where: {
        initiativeId: i.initiativeId,
        name: groupName
      }
    });

    const permissions = await Promise.all(
      groups.filter((x) => x.name === groupName).map((x) => groupRolePolicyVw.getGroupPermissions(x.groupId))
    ).then((x) => x.flat());

    return {
      groups: groups.map((x) => ({
        initiativeCode: i.code,
        groupId: x.groupId,
        initiativeId: x.initiativeId,
        name: x.name as GroupName,
        label: x.label
      })),
      permissions
    };
  });
};

export const listSubjectPermissionsService = async (currentContext: CurrentContext) => {
  return await unitOfWork.execute(async ({ groupRolePolicyVw, subjectGroup }) => {
    if (!currentContext.tokenPayload?.sub) throw new Problem(500, { detail: 'Unable to read token sub' });

    const groups = await subjectGroup.getSubjectGroups(currentContext.tokenPayload.sub);
    const permissions = await Promise.all(groups.map((x) => groupRolePolicyVw.getGroupPermissions(x.groupId))).then(
      (x) => x.flat()
    );

    // Double check correct COMS permissions.
    // This endpoint is called on client bootstrap, so it's a good place to verify
    //   COMS permissions without adding COMS calls to every API request.
    await assignPermissions(currentContext, currentContext.tokenPayload.sub, groups);

    return { groups, permissions };
  });
};

export const deleteSubjectGroupService = async (currentContext: CurrentContext, sub: string, groupId: number) => {
  return await unitOfWork.execute(async ({ group, initiative, subjectGroup }) => {
    const groups = await subjectGroup.getSubjectGroups(sub);
    const grp = groups.find((x) => x.groupId === groupId);
    if (grp?.initiativeCode === Initiative.PCNS)
      throw new Problem(422, { detail: 'Cannot delete a global group directly' });

    await subjectGroup.delete({
      sub_groupId: {
        sub: sub,
        groupId: groupId
      }
    });

    // Only remove global perm if user has no groups of the same type assigned in other initiatives
    if (!(await subjectGroup.subjectHasGroupName(sub, grp?.name))) {
      const correspondingGlobalGroup = await getCorrespondingGlobalGroup({ group, initiative }, groupId);
      await subjectGroup.delete({
        sub_groupId: {
          sub: sub,
          groupId: correspondingGlobalGroup.groupId
        }
      });
    }

    // Assign new COMS permissions
    try {
      const groupsAfterRmv = await subjectGroup.getSubjectGroups(sub);
      await assignPermissions(currentContext, sub, groupsAfterRmv);
    } catch (e) {
      if (e instanceof Error) log.warn(e.message);
      if (e instanceof Problem) log.warn(e.detail);
    }
  });
};
