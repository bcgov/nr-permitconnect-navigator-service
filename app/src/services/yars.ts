/* eslint-disable no-useless-catch */

import { comsService } from '.';
import prisma from '../db/dataConnection';
import { Group } from '../types/Group';
import { Initiative, GroupName, Action } from '../utils/enums/application';

const service = {
  /**
   * @function assignGroup
   * Assigns an identity to the given group
   * Assigns permissions to COMS based on the given group
   * @param {string | undefined} bearerToken The bearer token of the authorized user
   * @param {string} sub Subject of the authorized user
   * @param {number} groupId The group ID to add the user to
   * @returns {Promise<{sub: string; roleId: number;}>} The result of running the create operation
   */
  assignGroup: async (bearerToken: string | undefined, sub: string, groupId?: number) => {
    try {
      const groupResult = await prisma.group.findFirstOrThrow({
        where: {
          group_id: groupId
        }
      });

      const result = await prisma.subject_group.create({
        data: {
          sub: sub,
          group_id: groupResult.group_id
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

      return { sub: result.sub, roleId: result.group_id };
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
        name: x.group.name as GroupName,
        label: x.group.label
      })) as Array<Group>;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getGroupPolicyDetails
   * Gets a list of group/role/policy/resource/action matching the given parameters
   * @param {string} groupId Group ID to match on
   * @param {string} resourceName Resource name to match on
   * @param {string} actionName Action name to match on
   * @param {Initiative} initiative Optional initiative code to match on
   * @returns The result of running the findMany operation
   */
  getGroupPolicyDetails: async (groupId: number, resourceName: string, actionName: string, initiative?: Initiative) => {
    try {
      const result = await prisma.group_role_policy_vw.findMany({
        where: {
          group_id: groupId,
          resource_name: resourceName,
          action_name: actionName,
          initiative_code: initiative
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

  /**
   * @function getPCNSGroupPolicyDetails
   * Gets a list of group/role/policy/resource/action matching the given parameters for the PCNS initiative
   * @param {string} groupName Group name to match on
   * @param {string} resourceName Resource name to match on
   * @param {string} actionName Action name to match on
   * @returns The result of running the findMany operation
   */
  getPCNSGroupPolicyDetails: async (groupName: string, resourceName: string, actionName: string) => {
    try {
      const result = await prisma.group_role_policy_vw.findMany({
        where: {
          initiative_code: Initiative.PCNS,
          group_name: groupName,
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

  /**
   * @function getGroupPermissions
   * Gets a list of resource/actions associated with the given groupId
   * @param {number} groupId Group ID to search
   * @returns The result of running the findMany operation
   */
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

  /**
   * @function getGroups
   * Gets a list of groups for the given initiativeId
   * @param {number} initiativeId Initiative ID to search
   * @returns The result of running the findMany operation
   */
  getGroups: async (initiative: Initiative | undefined) => {
    try {
      const i = await prisma.initiative.findFirstOrThrow({
        where: {
          code: initiative
        }
      });

      const result = await prisma.group.findMany({
        where: {
          initiative_id: i.initiative_id
        }
      });

      return result.map((x) => ({
        groupId: x.group_id,
        initiativeId: x.initiative_id,
        name: x.name as GroupName,
        label: x.label
      }));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getPolicyAttributes
   * Gets a list of attributes associated with the given policyId
   * @param {number} policyId Policy ID to search
   * @returns The result of running the findMany operation
   */
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

  removeGroup: async (sub: string, groupId: number) => {
    try {
      const result = await prisma.subject_group.delete({
        where: {
          sub_group_id: {
            sub: sub,
            group_id: groupId
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
