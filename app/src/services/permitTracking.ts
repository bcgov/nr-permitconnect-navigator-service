import prisma from '../db/dataConnection';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Permit, PermitTracking } from '../types';

/**
 * @function upsertPermitTracking
 * Upsert Permit Tracking
 * @param tx Prisma transaction client
 * @param data Permit object
 * @returns A Promise that resolves to the upserted permit tracking object
 */
export const upsertPermitTracking = async (tx: PrismaTransactionClient, data: Permit) => {
  // TODO-PR: Move transaction and necessary services calls up to the controller layer
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
