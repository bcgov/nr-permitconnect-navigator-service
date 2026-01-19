import { Initiative as EInitiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Initiative } from '../types/index.ts';

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
