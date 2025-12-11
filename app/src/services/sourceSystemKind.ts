import type { PrismaTransactionClient } from '../db/dataConnection';

import type { SourceSystemKind } from '../types';

/**
 * Get all source system kinds and include their associated permit type ids
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of source system kinds along with their permit type ids
 */
export const getSourceSystemKinds = async (tx: PrismaTransactionClient): Promise<SourceSystemKind[]> => {
  const response = await tx.source_system_kind.findMany({
    orderBy: {
      sourceSystem: 'asc'
    },
    include: {
      permitTypeSourceSystemKindXref: {
        select: {
          permitTypeId: true
        }
      }
    }
  });

  // Transform to flatten permitTypeSourceSystemKindXref to an array of permit type IDs and rename the field
  const transformedResponse = response.map((item) => {
    const { permitTypeSourceSystemKindXref, ...rest } = item;
    return {
      ...rest,
      permitTypeIds: permitTypeSourceSystemKindXref?.map((pt) => pt.permitTypeId)
    };
  });

  return transformedResponse;
};
