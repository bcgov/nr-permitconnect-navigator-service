/* TODO: Create group policy details type and set explicit return types */

import { createBucket } from './coms.ts';
import { Initiative, GroupName, Action } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Group } from '../types/index.ts';

/**
 * Assigns an identity to the given group
 * Assigns permissions to COMS based on the given group
 * @param tx Prisma transaction client
 * @param bearerToken The bearer token of the authorized user
 * @param sub Subject of the authorized user
 * @param groupId The group ID to add the user to
 * @returns A Promise that resolve to an object with a subject and role id
 */
export const assignGroup = async (
  tx: PrismaTransactionClient,
  bearerToken: string | undefined,
  sub: string,
  groupId?: number
): Promise<{ sub: string; roleId: number }> => {
  const groupResult = await tx.group.findFirstOrThrow({
    where: {
      groupId
    }
  });

  const result = await tx.subject_group.create({
    data: {
      sub: sub,
      groupId: groupResult.groupId
    }
  });

  const comsPermsMap = new Map<GroupName, Action[]>([
    [GroupName.PROPONENT, [Action.CREATE]],
    [GroupName.NAVIGATOR, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
    [GroupName.NAVIGATOR_READ_ONLY, [Action.READ]],
    [GroupName.SUPERVISOR, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
    [GroupName.ADMIN, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
    [GroupName.DEVELOPER, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]]
  ]);

  const comsPerms = comsPermsMap.get(groupResult.name as GroupName);
  if (comsPerms && bearerToken) {
    await createBucket(bearerToken, comsPerms);
  }

  return { sub: result.sub, roleId: result.groupId };
};

/**
 * Gets groups for the specified identity
 * @param tx Prisma transaction client
 * @param sub Subject to search
 * @returns A Promise that resolves into an array of groups
 */
export const getSubjectGroups = async (tx: PrismaTransactionClient, sub: string): Promise<Group[]> => {
  const result = await tx.subject_group.findMany({
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
  })) as Group[];
};

/**
 * Gets a list of group/role/policy/resource/action matching the given parameters
 * @param tx Prisma transaction client
 * @param groupId Group ID to match on
 * @param resourceName Resource name to match on
 * @param actionName Action name to match on
 * @param initiative Optional initiative code to match on
 * @returns A Promise that resolves into an array of group policy details
 */
export const getGroupPolicyDetails = async (
  tx: PrismaTransactionClient,
  groupId: number,
  resourceName: string,
  actionName: string,
  initiative?: Initiative
  // ): Promise<GroupPolicyDetails[]> => {
) => {
  const result = await tx.group_role_policy_vw.findMany({
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
 * Gets a list of group/role/policy/resource/action matching the given parameters for the PCNS initiative
 * @param tx Prisma transaction client
 * @param groupName Group name to match on
 * @param resourceName Resource name to match on
 * @param actionName Action name to match on
 * @returns A Promise that resolves into an array of group policy details
 */
export const getPCNSGroupPolicyDetails = async (
  tx: PrismaTransactionClient,
  groupName: string,
  resourceName: string,
  actionName: string
  // ): Promise<GroupPolicyDetails[]> => {
) => {
  const result = await tx.group_role_policy_vw.findMany({
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
 * Gets a list of resource/actions associated with the given groupId
 * @param tx Prisma transaction client
 * @param groupId Group ID to search
 * @returns A Promise that resolves to array of permissions
 */
export const getGroupPermissions = async (tx: PrismaTransactionClient, groupId: number) => {
  const result = await tx.group_role_policy_vw.findMany({
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
 * Gets a list of groups for the given initiativeId
 * @param tx Prisma transaction client
 * @param initiative Initiative code to search
 * @returns A Promise that resolves to an array of groups
 */
export const getGroups = async (tx: PrismaTransactionClient, initiative: Initiative | undefined) => {
  const i = await tx.initiative.findFirstOrThrow({
    where: {
      code: initiative
    }
  });

  const result = await tx.group.findMany({
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
 * Gets a list of attributes associated with the given policyId
 * @param tx Prisma transaction client
 * @param policyId Policy ID to search
 * @returns A Promise that resolves to an array of policy attributes
 */
export const getPolicyAttributes = async (tx: PrismaTransactionClient, policyId: number) => {
  const result = await tx.policy_attribute.findMany({
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

/**
 * @param tx Prisma transaction client
 * @param sub The subject of the current user
 * @param groupId The ID of the group to remove
 * @returns A Promise that resolves to the result of the delete operation
 */
export const removeGroup = async (tx: PrismaTransactionClient, sub: string, groupId: number) => {
  const result = await tx.subject_group.delete({
    where: {
      sub_groupId: {
        sub: sub,
        groupId: groupId
      }
    }
  });

  return { sub: result.sub, roleId: result.groupId };
};
