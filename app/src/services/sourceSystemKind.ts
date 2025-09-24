import type { PrismaTransactionClient } from '../db/dataConnection';

import type { SourceSystemKind } from '../types';

/**
 * Get a source system kind
 * @param tx Prisma transaction client
 * @param sourceSystemKindId Id of the source system kind
 * @returns A Promise that resolves to a source system kind
 */
export const getSourceSystemKind = async (
  tx: PrismaTransactionClient,
  sourceSystemKindId: number
): Promise<SourceSystemKind> => {
  const response = await tx.source_system_kind.findUniqueOrThrow({
    where: {
      sourceSystemKindId
    }
  });

  return response;
};

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
