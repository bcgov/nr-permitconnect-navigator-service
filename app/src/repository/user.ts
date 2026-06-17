import { Prisma } from '@prisma/client';

import { BaseRepository } from './base.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { User } from '../types/models.ts';

export class UserRepository extends BaseRepository<
  User,
  Prisma.userCreateInput,
  Prisma.userUpdateInput,
  Prisma.userWhereUniqueInput,
  Prisma.userWhereInput,
  Prisma.userFindUniqueArgs,
  Prisma.userFindFirstArgs,
  Prisma.userFindManyArgs,
  PrismaTransactionClient['user']
> {
  private constructor(model: PrismaTransactionClient['user'], principal: string) {
    super(model, principal, false);
  }

  static create(tx: PrismaTransactionClient, principal: string): UserRepository {
    return new UserRepository(tx.user, principal);
  }
}
