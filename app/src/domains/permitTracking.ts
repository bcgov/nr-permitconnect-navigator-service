import { Repositories } from '../repository/unitOfWork';

import type { PermitTracking, PermitTrackingBase } from '../types';

/**
 * Upsert Permit Tracking
 * @param repositories - The required repositories
 * @param data - Array of permit tracking data
 * @returns A Promise that resolves to the upserted permit tracking object
 */
export const upsertPermitTracking = async (
  repositories: Pick<Repositories, 'permitTracking'>,
  data: PermitTrackingBase
): Promise<PermitTracking> => {
  if (data.permitTrackingId) {
    return await repositories.permitTracking.update({ permitTrackingId: data.permitTrackingId }, data);
  } else {
    return await repositories.permitTracking.create(data);
  }
};
