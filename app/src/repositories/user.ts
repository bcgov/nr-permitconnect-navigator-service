import { WritableRepository } from './writable.ts';
import { SYSTEM_ID } from '#src/utils/constants/application';

import type { PrismaTransactionClient } from '#src/db/database';
import type { UserSearchParameters } from '#types';

export class UserRepository extends WritableRepository<PrismaTransactionClient['user']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.user, principal);
  }

  public async findById(id: string) {
    return await this.findUnique({
      where: {
        userId: id
      }
    });
  }

  public async findBySub(sub: string) {
    return await this.findUnique({
      where: {
        sub
      }
    });
  }

  public async search(params: UserSearchParameters) {
    return await this.findMany({
      where: {
        AND: [
          {
            userId: { in: params.userId }
          },
          {
            idp: { in: params.idp, mode: 'insensitive' }
          },
          {
            sub: { contains: params.sub, mode: 'insensitive' }
          },
          {
            email: { contains: params.email, mode: 'insensitive' }
          },
          {
            firstName: { contains: params.firstName, mode: 'insensitive' }
          },
          {
            fullName: { contains: params.fullName, mode: 'insensitive' }
          },
          {
            lastName: { contains: params.lastName, mode: 'insensitive' }
          },
          {
            active: params.active
          }
        ],
        NOT: [
          {
            userId: SYSTEM_ID
          }
        ]
      }
    });
  }
}
