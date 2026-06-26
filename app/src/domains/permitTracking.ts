import type { PrismaTransactionClient } from '../db/database.ts';
import { Repositories } from '../repository/uow.ts';
import type { Permit, PermitTracking } from '../types/index.ts';

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
 * @param repositories - The required repositories
 * @param data - Array of permit tracking data
 * @returns A Promise that resolves to the upserted permit tracking object
 */
export const upsertPermitTracking = async (
  repositories: Pick<Repositories, 'permitTracking'>,
  data: PermitTracking
): Promise<PermitTracking> => {
  const permitTrackingData = {
    permitId: data.permitId,
    permitTrackingId: data.permitTrackingId,
    trackingId: data.trackingId,
    shownToProponent: data.shownToProponent,
    sourceSystemKindId: data.sourceSystemKindId
  };

  return await repositories.permitTracking.upsert(
    {
      permitTrackingId: permitTrackingData.permitTrackingId
    },
    permitTrackingData,
    permitTrackingData
  );
};
