import { Initiative as EInitiative } from '../utils/enums/application';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Initiative } from '../types';

/**
 * Create an activity for the given initiative with a unique identifier
 * @param tx Prisma transaction client
 * @param initiative The initiative code
 * @returns The result of running the findFirstOrThrow operation
 */
export const getInitiative = async (tx: PrismaTransactionClient, initiative: EInitiative): Promise<Initiative> => {
  const result = await tx.initiative.findFirstOrThrow({
    where: {
      code: initiative
    }
  });
  return result;
};
