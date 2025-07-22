/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';

import type { Permit, PermitTracking } from '../types';

const service = {
  /**
   * @function upsertPermitTracking
   * Upsert Permit Tracking
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the update operation
   */
  upsertPermitTracking: async (data: Permit) => {
    try {
      return await prisma.$transaction(async (trx) => {
        // Delete any permit tracking that is not in the new data
        await trx.permit_tracking.deleteMany({
          where: {
            permitId: data.permitId,
            permitTrackingId: {
              notIn: data.permitTracking?.map((x: PermitTracking) => x.permitTrackingId).filter((x) => x) as number[]
            }
          }
        });

        // Upsert the permit tracking
        if (data.permitTracking?.length) {
          await Promise.all(
            data.permitTracking.map(async (x: PermitTracking) => {
              if (x.permitTrackingId) {
                await trx.permit_tracking.update({
                  where: {
                    permitTrackingId: x.permitTrackingId
                  },
                  data: {
                    permitId: data.permitId,
                    trackingId: x.trackingId,
                    sourceSystemKindId: x?.sourceSystemKindId,
                    shownToProponent: x?.shownToProponent ?? false,
                    updatedBy: data.updatedBy
                  }
                });
              } else {
                await trx.permit_tracking.create({
                  data: {
                    permitId: data.permitId,
                    trackingId: x.trackingId,
                    sourceSystemKindId: x?.sourceSystemKindId,
                    shownToProponent: x?.shownToProponent ?? false,
                    createdBy: data.createdBy,
                    updatedBy: data.updatedBy
                  }
                });
              }
            })
          );
        }
      });
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
