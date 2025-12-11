import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Permit, PermitTracking } from '../types';

/**
 * Deletes many Permit Tracking from a Permit
 * @param tx Prisma transaction client
 * @param data Permit object
 * @returns A Promise that resolves when complete
 */
export const deleteManyPermitTracking = async (tx: PrismaTransactionClient, data: Permit): Promise<void> => {
  await tx.permit_tracking.deleteMany({
    where: {
      permitId: data.permitId,
      permitTrackingId: {
        notIn: data.permitTracking?.map((x: PermitTracking) => x.permitTrackingId).filter((x) => x)
      }
    }
  });
};

/**
 * Upsert Permit Tracking
 * @param tx Prisma transaction client
 * @param data Permit object
 * @returns A Promise that resolves to the upserted permit tracking object
 */
export const upsertPermitTracking = async (tx: PrismaTransactionClient, data: Permit): Promise<PermitTracking[]> => {
  let response: PermitTracking[] = [];
  if (data.permitTracking?.length) {
    response = await Promise.all(
      data.permitTracking.map(async (pt: PermitTracking) => {
        const permitTrackingData = {
          permitId: data.permitId,
          permitTrackingId: pt.permitTrackingId,
          trackingId: pt.trackingId,
          shownToProponent: pt.shownToProponent,
          sourceSystemKindId: pt.sourceSystemKindId
        };

        if (pt.permitTrackingId) {
          return await tx.permit_tracking.update({
            where: {
              permitTrackingId: pt.permitTrackingId
            },
            data: permitTrackingData
          });
        } else {
          return await tx.permit_tracking.create({
            data: permitTrackingData
          });
        }
      })
    );
  }

  return response;
};
