import { Prisma } from '@prisma/client';

import { BaseRepository } from './base.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { AccessRequest } from '../types/models.ts';

export class AccessRequestRepository extends BaseRepository<
  AccessRequest,
  Prisma.access_requestCreateInput,
  Prisma.access_requestUpdateInput,
  Prisma.access_requestWhereUniqueInput,
  Prisma.access_requestWhereInput,
  Prisma.access_requestFindUniqueArgs,
  Prisma.access_requestFindFirstArgs,
  Prisma.access_requestFindManyArgs,
  PrismaTransactionClient['access_request']
> {
  private constructor(model: PrismaTransactionClient['access_request'], principal: string) {
    super(model, principal, false);
  }

  static create(tx: PrismaTransactionClient, principal: string): AccessRequestRepository {
    return new AccessRequestRepository(tx.access_request, principal);
  }
}
