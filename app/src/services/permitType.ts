import { unitOfWork } from '#src/db/unitOfWork';

import type { PermitType } from '#types';
import type { Initiative } from '#src/utils/enums/application';

/**
 * Lists Permit types
 * @param initiative Optional Initiative code to match on
 * @returns A Promise that resolves to an array of permit types
 */
export const listPermitTypesService = async (initiative?: Initiative): Promise<PermitType[]> => {
  return await unitOfWork.execute(async ({ permitType }) => {
    return permitType.findMany({
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
  });
};
