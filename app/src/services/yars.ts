/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';

const service = {
  /**
   * @function getEnquiry
   * Gets roles for the specified identity
   * @param {string} identityId Identity ID to search
   * @returns {Promise<roleId: number>} The result of running the findMany operation
   */
  getIdentityRoles: async (identityId: string) => {
    try {
      const result = await prisma.identity_role.findMany({
        where: {
          identity_id: identityId
        }
      });

      return result.map((x) => ({ roleId: x.role_id }));
    } catch (e: unknown) {
      throw e;
    }
  },

  getRolePermissionDetails: async (roleId: number, resourceName: string, actionName: string) => {
    try {
      const result = await prisma.role_permission_vw.findMany({
        where: {
          role_id: roleId,
          resource_name: resourceName,
          action_name: actionName
        }
      });

      return result.map((x) => ({
        initiativeName: x.initiative_name,
        userType: x.user_type,
        policyName: x.policy_name,
        scopeName: x.scope_name,
        scopePriority: x.scope_priority,
        resourceName: x.resource_name,
        actionName: x.action_name
      }));
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
