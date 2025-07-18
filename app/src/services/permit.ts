/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { permit, permit_type } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

import { Initiative } from '../utils/enums/application';

import type { ListPermitsOptions, Permit, PermitTracking } from '../types';

const service = {
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
        permit_tracking: { include: { sourceSystemKind: true } }
      }
    });

    return result ? permit.fromPrismaModelWithNotesTracking(result) : null;
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
            sourceSystemKind: true
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
      return response.map((x) => permit.fromPrismaModelWithNotesTracking(x));
    }

    return response.map((x) => permit.fromPrismaModelWithTracking(x));
  },

  /**
   * @function upsertPermit
   * Upsert a Permit
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the update operation
   */
  upsertPermit: async (data: Permit) => {
    try {
      const permitDataWithId = { ...data, permitId: data.permitId || uuidv4() };

      // Upsert the permit
      const response = await prisma.$transaction(async (trx) => {
        const response = await trx.permit.upsert({
          include: {
            permit_type: true
          },
          where: {
            permit_id: permitDataWithId.permitId
          },
          update: { ...permit.toPrismaModel(permitDataWithId), updated_by: permitDataWithId.updatedBy },
          create: {
            ...permit.toPrismaModel({ ...permitDataWithId }),
            created_by: permitDataWithId.createdBy,
            updated_by: permitDataWithId.updatedBy
          }
        });

        // Delete any permit tracking that is not in the new data
        await trx.permit_tracking.deleteMany({
          where: {
            permitId: permitDataWithId.permitId,
            permitTrackingId: {
              notIn: permitDataWithId.permitTracking
                ?.map((x: PermitTracking) => x.permitTrackingId)
                .filter((x) => x) as number[]
            }
          }
        });

        // Upsert the permit tracking
        if (permitDataWithId.permitTracking?.length) {
          await Promise.all(
            permitDataWithId.permitTracking.map(async (x: PermitTracking) => {
              if (x.permitTrackingId) {
                await trx.permit_tracking.update({
                  where: {
                    permitTrackingId: x.permitTrackingId
                  },
                  data: {
                    permitId: permitDataWithId.permitId,
                    trackingId: x.trackingId,
                    sourceSystemKindId: x?.sourceSystemKindId,
                    shownToProponent: x?.shownToProponent ?? false,
                    updatedBy: permitDataWithId.updatedBy
                  }
                });
              } else {
                await trx.permit_tracking.create({
                  data: {
                    permitId: permitDataWithId.permitId,
                    trackingId: x.trackingId,
                    sourceSystemKindId: x?.sourceSystemKindId,
                    shownToProponent: x?.shownToProponent ?? false,
                    createdBy: permitDataWithId.createdBy,
                    updatedBy: permitDataWithId.updatedBy
                  }
                });
              }
            })
          );
        }
        return response;
      });

      return permit.fromPrismaModel(response);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
