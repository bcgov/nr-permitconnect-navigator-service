import { PrismaTransactionClient } from '../db/database';
import { Initiative } from '../utils/enums/application';

import type { PermitType } from '../types';

/**
 * Lists Permit types
 * @param tx Prisma transaction client
 * @param initiative Optional Initiative code to match on
 * @returns A Promise that resolves to an array of permit types
 */
export const listPermitTypes = async (tx: PrismaTransactionClient, initiative?: Initiative): Promise<PermitType[]> => {
  const result = await tx.permit_type.findMany({
    include: {
      permitTypeInitiativeXref: {
        include: {
          initiative: true
        }
      }
    },
    where: initiative
      ? {
          permitTypeInitiativeXref: {
            some: {
              initiative: {
                code: initiative
              }
            }
          }
        }
      : undefined,
    orderBy: [
      {
        businessDomain: 'asc'
      },
      {
        name: 'asc'
      }
    ]
  });

  return result;
};
