import { Prisma } from '@prisma/client';

import { BaseRepository } from './base.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { Initiative } from '../types/models.ts';

export class InitiativeRepository extends BaseRepository<
  Initiative,
  Prisma.initiativeCreateInput,
  Prisma.initiativeUpdateInput,
  Prisma.initiativeWhereUniqueInput,
  Prisma.initiativeWhereInput,
  Prisma.initiativeFindUniqueArgs,
  Prisma.initiativeFindFirstArgs,
  Prisma.initiativeFindManyArgs,
  PrismaTransactionClient['initiative']
> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.initiative, principal);
  }
}
