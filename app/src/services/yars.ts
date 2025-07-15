import { comsService } from '.';
import prisma from '../db/dataConnection';
import { Initiative, GroupName, Action } from '../utils/enums/application';

import type { Group } from '../types';

/**
 * @function assignGroup
 * Assigns an identity to the given group
 * Assigns permissions to COMS based on the given group
 * @param {string | undefined} bearerToken The bearer token of the authorized user
 * @param {string} sub Subject of the authorized user
 * @param {number} groupId The group ID to add the user to
 * @returns {Promise<{sub: string; roleId: number;}>} The result of running the create operation
 */
export const assignGroup = async (bearerToken: string | undefined, sub: string, groupId?: number) => {
  const groupResult = await prisma.group.findFirstOrThrow({
    where: {
      groupId
    }
  });

  const result = await prisma.subject_group.create({
    data: {
      sub: sub,
      groupId: groupResult.groupId
    }
  });

  const comsPermsMap = new Map<GroupName, Array<Action>>([
    [GroupName.PROPONENT, [Action.CREATE]],
    [GroupName.NAVIGATOR, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
    [GroupName.NAVIGATOR_READ_ONLY, [Action.READ]],
    [GroupName.SUPERVISOR, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
    [GroupName.ADMIN, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
    [GroupName.DEVELOPER, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]]
  ]);

  const comsPerms = comsPermsMap.get(groupResult.name as GroupName);
  if (comsPerms && bearerToken) {
    await comsService.createBucket(bearerToken, comsPerms);
  }

  return { sub: result.sub, roleId: result.groupId };
};

/**
 * @function getSubjectGroups
 * Gets groups for the specified identity
 * @param {string} sub Subject to search
 * @returns {Promise<Array<Group>>} The result of running the findMany operation
 */
export const getSubjectGroups = async (sub: string) => {
  const result = await prisma.subject_group.findMany({
    where: {
      sub: sub
    },
    include: {
      group: {
        include: {
          initiative: true
        }
      }
    }
  });

  return result.map((x) => ({
    initiativeCode: x.group.initiative.code,
    initiativeId: x.group.initiativeId,
    groupId: x.groupId,
    name: x.group.name as GroupName,
    label: x.group.label
  })) as Array<Group>;
};

/**
 * @function getGroupPolicyDetails
 * Gets a list of group/role/policy/resource/action matching the given parameters
 * @param {string} groupId Group ID to match on
 * @param {string} resourceName Resource name to match on
 * @param {string} actionName Action name to match on
 * @param {Initiative} initiative Optional initiative code to match on
 * @returns The result of running the findMany operation
 */
export const getGroupPolicyDetails = async (
  groupId: number,
  resourceName: string,
  actionName: string,
  initiative?: Initiative
) => {
  const result = await prisma.group_role_policy_vw.findMany({
    where: {
      groupId: groupId,
      resourceName: resourceName,
      actionName: actionName,
      initiativeCode: initiative
    }
  });

  return result.map((x) => ({
    groupId: x.groupId,
    initiativeCode: x.initiativeCode,
    groupName: x.groupName,
    roleName: x.roleName,
    policyId: x.policyId,
    resourceName: x.resourceName,
    actionName: x.actionName
  }));
};

/**
 * @function getPCNSGroupPolicyDetails
 * Gets a list of group/role/policy/resource/action matching the given parameters for the PCNS initiative
 * @param {string} groupName Group name to match on
 * @param {string} resourceName Resource name to match on
 * @param {string} actionName Action name to match on
 * @returns The result of running the findMany operation
 */
export const getPCNSGroupPolicyDetails = async (groupName: string, resourceName: string, actionName: string) => {
  const result = await prisma.group_role_policy_vw.findMany({
    where: {
      initiativeCode: Initiative.PCNS,
      groupName: groupName,
      resourceName: resourceName,
      actionName: actionName
    }
  });

  return result.map((x) => ({
    groupId: x.groupId,
    initiativeCode: x.initiativeCode,
    groupName: x.groupName,
    roleName: x.roleName,
    policyId: x.policyId,
    resourceName: x.resourceName,
    actionName: x.actionName
  }));
};

/**
 * @function getGroupPermissions
 * Gets a list of resource/actions associated with the given groupId
 * @param {number} groupId Group ID to search
 * @returns The result of running the findMany operation
 */
export const getGroupPermissions = async (groupId: number) => {
  const result = await prisma.group_role_policy_vw.findMany({
    where: {
      groupId
    }
  });

  return result.map((x) => ({
    group: x.groupName,
    initiative: x.initiativeCode,
    resource: x.resourceName,
    action: x.actionName
  }));
};

/**
 * @function getGroups
 * Gets a list of groups for the given initiativeId
 * @param {string} initiative Initiative code to search
 * @returns The result of running the findMany operation
 */
export const getGroups = async (initiative: Initiative | undefined) => {
  const i = await prisma.initiative.findFirstOrThrow({
    where: {
      code: initiative
    }
  });

  const result = await prisma.group.findMany({
    where: {
      initiativeId: i.initiativeId
    }
  });

  return result.map((x) => ({
    groupId: x.groupId,
    initiativeId: x.initiativeId,
    name: x.name as GroupName,
    label: x.label
  }));
};

/**
 * @function getPolicyAttributes
 * Gets a list of attributes associated with the given policyId
 * @param {number} policyId Policy ID to search
 * @returns The result of running the findMany operation
 */
export const getPolicyAttributes = async (policyId: number) => {
  const result = await prisma.policy_attribute.findMany({
    where: {
      policyId
    },
    include: {
      attribute: {
        include: {
          attributeGroup: true
        }
      }
    }
  });

  return result.map((x) => ({
    attributeId: x.attribute.attributeId,
    attributeName: x.attribute.name,
    groupId: x.attribute.attributeGroup.map((x) => x.groupId)
  }));
};

export const removeGroup = async (sub: string, groupId: number) => {
  const result = await prisma.subject_group.delete({
    where: {
      sub_groupId: {
        sub: sub,
        groupId: groupId
      }
    }
  });

  return { sub: result.sub, roleId: result.groupId };
};
