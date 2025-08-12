import prisma from '../db/dataConnection';

import { Initiative } from '../utils/enums/application';

import type { ListPermitsOptions, Permit, PermitBase, PermitType } from '../types';

/**
 * @function deletePermit
 * Delete a permit
 * @param {string} permitId Permit ID
 * @returns {Promise<Permit>} The result of running the delete operation
 */
export const deletePermit = async (permitId: string): Promise<Permit> => {
  const response = await prisma.permit.delete({
    include: {
      permitType: true
    },
    where: {
      permitId: permitId
    }
  });

  return response;
};

/**
 * @function deletePermitByActivity
 * Delete a permit
 * @param {string} activityId Activity ID to remove permits from
 * @returns {number} The result of running the deleteMany operation
 */
export const deletePermitsByActivity = async (activityId: string): Promise<number> => {
  const response = await prisma.permit.deleteMany({
    where: {
      activityId: activityId
    }
  });

  return response.count;
};

/**
 * @function getPermit
 * Get a permit
 * @param {string} permitId Permit ID
 * @returns {Promise<Permit>} The result of running the findFirst operation
 */
export const getPermit = async (permitId: string): Promise<Permit> => {
  const result = await prisma.permit.findFirstOrThrow({
    where: {
      permitId: permitId
    },
    include: {
      permitType: true,
      permitNote: { orderBy: { createdAt: 'desc' } },
      permitTracking: { include: { sourceSystemKind: true } }
    }
  });

  return result;
};

/**
 * @function getPermitTypes
 * Get all Permit types for the given initiative
 * @returns {Promise<PermitType[]>} The result of running the findMany operation
 */
export const getPermitTypes = async (initiative: Initiative): Promise<PermitType[]> => {
  const initiativeResult = await prisma.initiative.findFirstOrThrow({
    include: {
      permitTypeInitiativeXref: {
        include: {
          permitType: true
        },
        orderBy: [
          {
            permitType: {
              businessDomain: 'asc'
            }
          },
          {
            permitType: {
              name: 'asc'
            }
          }
        ]
      }
    },
    where: {
      code: initiative
    }
  });

  return initiativeResult.permitTypeInitiativeXref.map((y) => y.permitType);
};

/**
 * @function listPermits
 * Retrieve all permits if no activityId is provided, otherwise retrieve permits for a specific activity
 * @param {string} activityId PCNS Activity ID
 * @returns {Promise<Permit[]>} The result of running the findMany operation
 */
export const listPermits = async (options?: ListPermitsOptions): Promise<Permit[]> => {
  const response = await prisma.permit.findMany({
    include: {
      permitType: true,
      permitNote: options?.includeNotes ? { orderBy: { createdAt: 'desc' } } : false,
      permitTracking: {
        include: {
          sourceSystemKind: true
        }
      }
    },
    where: {
      activityId: options?.activityId || undefined
    },
    orderBy: {
      permitType: {
        name: 'asc'
      }
    }
  });

  return response;
};

/**
 * @function upsertPermit
 * Upsert a Permit
 * @param {Permit} data Permit object
 * @returns {Promise<Permit | null>} The result of running the update operation
 */
export const upsertPermit = async (data: PermitBase): Promise<Permit> => {
  const response = await prisma.permit.upsert({
    include: {
      permitType: true
    },
    where: {
      permitId: data.permitId
    },
    update: { ...data, updatedBy: data.updatedBy },
    create: {
      ...data,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    }
  });

  return response;
};
