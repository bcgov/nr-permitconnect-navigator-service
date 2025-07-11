import prisma from '../db/dataConnection';
import { v4 as uuidv4 } from 'uuid';

import { Initiative } from '../utils/enums/application';

import type { ListPermitsOptions, Permit } from '../types';

const service = {
  /**
   * @function createPermit
   * Creates a Permit
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the create operation
   */
  createPermit: async (data: Permit) => {
    const newPermit = { ...data, permitId: uuidv4() };

    const create = await prisma.permit.create({
      include: {
        permitType: true
      },
      data: { ...newPermit, createdBy: data.createdBy, updatedBy: data.updatedBy }
    });
    return create;
  },

  /**
   * @function deletePermit
   * Delete a permit
   * @param {string} permitId Permit ID
   * @returns {Promise<Permit>} The result of running the delete operation
   */
  deletePermit: async (permitId: string) => {
    const response = await prisma.permit.delete({
      include: {
        permitType: true
      },
      where: {
        permitId
      }
    });

    return response;
  },

  /**
   * @function deletePermitByActivity
   * Delete a permit
   * @param {string} activityId Activity ID to remove permits from
   * @returns {number} The result of running the deleteMany operation
   */
  deletePermitsByActivity: async (activityId: string) => {
    const response = await prisma.permit.deleteMany({
      where: {
        activityId: activityId
      }
    });

    return response.count;
  },

  /**
   * @function getPermit
   * Get a permit
   * @param {string} permitId Permit ID
   * @returns {Promise<Permit>} The result of running the findFirst operation
   */
  getPermit: async (permitId: string) => {
    const result = await prisma.permit.findFirst({
      where: {
        permitId: permitId
      },
      include: {
        permitType: true, // If changed reflect in type and model
        permitNote: { orderBy: { createdAt: 'desc' } }
      }
    });

    return result;
  },

  /**
   * @function getPermitTypes
   * Get all Permit types for the given initiative
   * @returns {Promise<PermitType[]>} The result of running the findMany operation
   */
  getPermitTypes: async (initiative: Initiative) => {
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
  },

  /**
   * @function listPermits
   * Retrieve all permits if no activityId is provided, otherwise retrieve permits for a specific activity
   * @param {string} activityId PCNS Activity ID
   * @returns {Promise<Permit[]>} The result of running the findMany operation
   */
  listPermits: async (options?: ListPermitsOptions) => {
    const response = await prisma.permit.findMany({
      include: {
        permitType: true,
        permitNote: options?.includeNotes ? { orderBy: { createdAt: 'desc' } } : false
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
  },

  /**
   * @function upsertPermit
   * Upsert a Permit
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the update operation
   */
  updatePermit: async (data: Permit) => {
    const response = await prisma.permit.update({
      include: {
        permitType: true
      },
      data: data,
      where: {
        permitId: data.permitId
      }
    });

    return response;
  }
};

export default service;
