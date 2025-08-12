import prisma from '../db/dataConnection';

import type { Permit, PermitTracking } from '../types/models';

/**
 * @function upsertPermitTracking
 * Upsert Permit Tracking
 * @param {Permit} data Permit object
 * @returns {Promise<Permit | null>} The result of running the update operation
 */
export const upsertPermitTracking = async (data: Permit) => {
  return await prisma.$transaction(async (trx) => {
    // Delete any permit tracking that is not in the new data
    await trx.permit_tracking.deleteMany({
      where: {
        permitId: data.permitId,
        permitTrackingId: {
          notIn: data.permitTracking?.map((x: PermitTracking) => x.permitTrackingId).filter((x) => x)
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
            const createData = {
              permitId: data.permitId,
              trackingId: x.trackingId,
              sourceSystemKindId: x?.sourceSystemKindId,
              shownToProponent: x?.shownToProponent ?? false,
              createdBy: data.createdBy,
              updatedBy: data.updatedBy
            };
            await trx.permit_tracking.create({
              data: createData
            });
          }
        })
      );
    }
  });
};
