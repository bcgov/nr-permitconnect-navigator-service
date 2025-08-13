import type { PrismaTransactionClient } from '../db/dataConnection';

/**
 * Get all source system kinds
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of source system kinds
 */
export const getSourceSystemKinds = async (tx: PrismaTransactionClient) => {
  const response = await tx.source_system_kind.findMany({
    orderBy: {
      sourceSystem: 'asc'
    }
  });

  return response;
};
