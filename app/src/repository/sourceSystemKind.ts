import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class SourceSystemKindRepository extends WritableRepository<PrismaTransactionClient['source_system_kind']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.source_system_kind, principal);
  }

  public async list() {
    const result = await this.model.findMany({
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
    const transformedResponse = result.map((item) => {
      const { permitTypeSourceSystemKindXref, ...rest } = item;
      return {
        ...rest,
        permitTypeIds: permitTypeSourceSystemKindXref?.map((pt) => pt.permitTypeId)
      };
    });

    return transformedResponse;
  }
}
