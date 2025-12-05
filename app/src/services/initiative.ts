import { Initiative as EInitiative } from '../utils/enums/application';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Initiative } from '../types';

/**
 * Fetches an initiative for the given initiative code
 * @param tx Prisma transaction client
 * @param initiative The initiative code
 * @returns A Promise that resolves to the specific initiative
 */
export const getInitiative = async (tx: PrismaTransactionClient, initiative: EInitiative): Promise<Initiative> => {
  const result = await tx.initiative.findFirstOrThrow({
    where: {
      code: initiative
    }
  });
  return result;
};

/**
 * Fetches an initiative for the given activity id
 * @param tx Prisma transaction client
 * @param activityId The activityId
 * @returns A Promise that resolves to the specific initiative
 */
export const getInitiativeByActivity = async (tx: PrismaTransactionClient, activityId: string): Promise<Initiative> => {
  const activity = await tx.activity.findFirstOrThrow({
    where: {
      activityId: activityId
    },
    include: {
      initiative: true
    }
  });

  return activity.initiative;
};
