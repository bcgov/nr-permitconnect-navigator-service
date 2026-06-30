import { WritableRepository } from './writable.ts';
import { SYSTEM_ID } from '../utils/constants/application.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { UserSearchParameters } from '../types/stuff';

export class UserRepository extends WritableRepository<PrismaTransactionClient['user']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.user, principal);
  }

  async search(params: UserSearchParameters) {
    return await this.model.findMany({
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
