/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { permit, permit_type } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

import { Initiative } from '../utils/enums/application';

import type { ListPermitsOptions, Permit, PermitTracking } from '../types';

const service = {
  /**
   * @function createPermit
   * Creates a Permit
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the create operation
   */
  createPermit: async (data: Permit) => {
    try {
      const response = await prisma.$transaction(async (trx) => {
        const newPermit = { ...data, permitId: uuidv4() };

        const createResponse = await trx.permit.create({
          include: {
            permit_type: true
          },
          data: { ...permit.toPrismaModel(newPermit), created_by: data.createdBy, updated_by: data.updatedBy }
        });

        if (data?.permitTracking) {
          await trx.permit_tracking.createMany({
            data: data?.permitTracking?.map((x: PermitTracking) => ({
              permitId: newPermit?.permitId,
              trackingId: x.trackingId,
              sourceSystemKindId: x?.sourceSystemKindId,
              shownToProponent: x?.shownToProponent ?? false,
              createdBy: data.createdBy,
              updatedBy: data.updatedBy
            }))
          });
        }
        return createResponse;
      });
      //@ts-expect-error - mapping issue with permit_tracking
      return permit.fromPrismaModel(response);
    } catch (e: unknown) {
      throw e;
    }
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
        permit_type: true
      },
      where: {
        permit_id: permitId
      }
    });
    //@ts-expect-error - mapping issue with permit_tracking
    return permit.fromPrismaModel(response);
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
        activity_id: activityId
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
        permit_id: permitId
      },
      include: {
        permit_type: true, // If changed reflect in type and model
        permit_note: { orderBy: { created_at: 'desc' } },
        permit_tracking: true
      }
    });
    //@ts-expect-error - mapping issue with permit_tracking
    return result ? permit.fromPrismaModelWithNotes(result) : null;
  },

  /**
   * @function getPermitTypes
   * Get all Permit types for the given initiative
   * @returns {Promise<PermitType[]>} The result of running the findMany operation
   */
  getPermitTypes: async (initiative: Initiative) => {
    const initiativeResult = await prisma.initiative.findFirstOrThrow({
      include: {
        permit_type_initiative_xref: {
          include: {
            permit_type: true
          },
          orderBy: [
            {
              permit_type: {
                business_domain: 'asc'
              }
            },
            {
              permit_type: {
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

    return initiativeResult.permit_type_initiative_xref.map((y) => permit_type.fromPrismaModel(y.permit_type));
  },

  /**
   * @function getSourceSystems
   * Get all Source Systems
   * @returns {Promise<PermitType[]>} The result of running the findMany operation
   */
  getSourceSystems: async () => {
    const response = await prisma.source_system_code.findMany({
      include: {
        source_system_kind_source_system_kind_source_system_codeTosource_system_code: true
      },
      orderBy: {
        acronym: 'asc'
      }
    });
    return response;
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
        permit_type: true,
        permit_note: options?.includeNotes ? { orderBy: { created_at: 'desc' } } : false,
        permit_tracking: {
          include: {
            source_system_kind: true
          }
        }
      },
      where: {
        activity_id: options?.activityId || undefined
      },
      orderBy: {
        permit_type: {
          name: 'asc'
        }
      }
    });

    if (options?.includeNotes) {
      return response.map((x) => permit.fromPrismaModelWithNotes(x));
    }

    return response.map((x) => permit.fromPrismaModel(x));
  },

  /**
   * @function updatePermit
   * Updates a Permit
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the update operation
   */
  updatePermit: async (data: Permit) => {
    try {
      const response = await prisma.permit.update({
        include: {
          permit_type: true
        },
        data: { ...permit.toPrismaModel(data), updated_by: data.updatedBy },
        where: {
          permit_id: data.permitId
        }
      });
      //@ts-expect-error - mapping issue with permit_tracking
      return permit.fromPrismaModel(response);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
