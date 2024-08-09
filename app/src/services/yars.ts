/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { Initiative, GroupName } from '../utils/enums/application';

const service = {
  assignGroup: async (identityId: string, initiative: Initiative, group: GroupName) => {
    try {
      const i = await prisma.initiative.findFirstOrThrow({
        where: {
          code: initiative
        }
      });

      const groupResult = await prisma.group.findFirstOrThrow({
        where: {
          initiative_id: i.initiative_id,
          name: group
        }
      });

      const result = await prisma.identity_group.create({
        data: {
          identity_id: identityId,
          group_id: groupResult.group_id
        }
      });

      return { identityId: result.identity_id, roleId: result.group_id };
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getIdentityGroups
   * Gets groups for the specified identity
   * @param {string} identityId Identity ID to search
   * @returns {Promise<roleId: number>} The result of running the findMany operation
   */
  getIdentityGroups: async (identityId: string) => {
    try {
      const result = await prisma.identity_group.findMany({
        where: {
          identity_id: identityId
        },
        include: {
          group: true
        }
      });

      return result.map((x) => ({
        initiativeId: x.group.initiative_id,
        groupId: x.group_id,
        groupName: x.group.name
      }));
    } catch (e: unknown) {
      throw e;
    }
  },

  getGroupPolicyDetails: async (
    groupId: number,
    initiativeCode: Initiative,
    resourceName: string,
    actionName: string
  ) => {
    try {
      const result = await prisma.group_role_policy_vw.findMany({
        where: {
          group_id: groupId,
          initiative_code: initiativeCode,
          resource_name: resourceName,
          action_name: actionName
        }
      });

      return result.map((x) => ({
        groupId: x.group_id,
        initiativeCode: x.initiative_code,
        groupName: x.group_name,
        roleName: x.role_name,
        policyId: x.policy_id,
        resourceName: x.resource_name,
        actionName: x.action_name
      }));
    } catch (e: unknown) {
      throw e;
    }
  },

  getGroupPermissions: async (groupId: number) => {
    try {
      const result = await prisma.group_role_policy_vw.findMany({
        where: {
          group_id: groupId
        }
      });

      return result.map((x) => ({
        group: x.group_name,
        initiative: x.initiative_code,
        resource: x.resource_name,
        action: x.action_name
      }));
    } catch (e: unknown) {
      throw e;
    }
  },

  getPolicyAttributes: async (policyId: number) => {
    try {
      const result = await prisma.policy_attribute.findMany({
        where: {
          policy_id: policyId
        },
        include: {
          attribute: {
            include: {
              attribute_group: true
            }
          }
        }
      });

      return result.map((x) => ({
        attributeId: x.attribute.attribute_id,
        attributeName: x.attribute.name,
        groupId: x.attribute.attribute_group.map((x) => x.group_id)
      }));
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
