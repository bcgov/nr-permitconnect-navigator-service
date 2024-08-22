/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { Initiative, GroupName } from '../utils/enums/application';

const service = {
  assignGroup: async (sub: string, initiative: Initiative, group: GroupName) => {
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

      const result = await prisma.subject_group.create({
        data: {
          sub: sub,
          group_id: groupResult.group_id
        }
      });

      return { identityId: result.sub, roleId: result.group_id };
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getSubjectGroups
   * Gets groups for the specified identity
   * @param {string} sub Subject to search
   * @returns {Promise<roleId: number>} The result of running the findMany operation
   */
  getSubjectGroups: async (sub: string) => {
    try {
      const result = await prisma.subject_group.findMany({
        where: {
          sub: sub
        },
        include: {
          group: true
        }
      });

      return result.map((x) => ({
        initiativeId: x.group.initiative_id,
        groupId: x.group_id,
        groupName: x.group.name as GroupName
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
  },

  removeGroup: async (sub: string, initiative: Initiative, group: GroupName) => {
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

      const result = await prisma.subject_group.delete({
        where: {
          sub_group_id: {
            sub: sub,
            group_id: groupResult.group_id
          }
        }
      });

      return { sub: result.sub, roleId: result.group_id };
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
