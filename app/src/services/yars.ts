/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { AccessRole, Initiative } from '../utils/enums/application';

const service = {
  assignRole: async (identityId: string, role: AccessRole, initiative?: Initiative) => {
    try {
      let roleResult;

      if (initiative) {
        const i = await prisma.initiative.findFirstOrThrow({
          where: {
            code: initiative
          }
        });

        roleResult = await prisma.role.findFirstOrThrow({
          where: {
            initiative_id: i.initiative_id,
            user_type: role
          }
        });
      } else {
        roleResult = await prisma.role.findFirstOrThrow({
          where: {
            initiative_id: null,
            user_type: role
          }
        });
      }

      const result = await prisma.identity_role.create({
        data: {
          identity_id: identityId,
          role_id: roleResult.role_id
        }
      });

      return { identityId: result.identity_id, roleId: result.role_id };
    } catch (e: unknown) {
      throw e;
    }
  },

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
        },
        include: {
          role: true
        }
      });

      return result.map((x) => ({ roleId: x.role_id, userType: x.role.user_type }));
    } catch (e: unknown) {
      throw e;
    }
  },

  getRolePermissionDetails: async (
    roleId: number,
    initiativeName: Initiative,
    resourceName: string,
    actionName: string
  ) => {
    try {
      const result = await prisma.role_permission_vw.findMany({
        where: {
          role_id: roleId,
          initiative_name: initiativeName.toLowerCase(),
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
  },

  getRolePermissions: async (roleId: number) => {
    try {
      const result = await prisma.role_permission_vw.findMany({
        where: {
          role_id: roleId
        }
      });

      return result.map((x) => ({
        initiativeName: x.initiative_name,
        resourceName: x.resource_name,
        actionName: x.action_name
      }));
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
