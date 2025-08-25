import type { PrismaTransactionClient } from '../db/dataConnection';

import type { SourceSystemKind } from '../types';

/**
 * Get all source system kinds
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of source system kinds
 */
export const getSourceSystemKinds = async (tx: PrismaTransactionClient): Promise<SourceSystemKind[]> => {
  const response = await tx.source_system_kind.findMany({
    orderBy: {
      sourceSystem: 'asc'
    }
  });

  return response;
};
