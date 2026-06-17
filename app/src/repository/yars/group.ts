import { Prisma } from '@prisma/client';

import { BaseRepository } from '../base.ts';

import type { PrismaTransactionClient } from '../../db/database.ts';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const group = Prisma.validator<Prisma.groupDefaultArgs>()({});
export type GroupBase = Prisma.groupGetPayload<typeof group>;

export class GroupRepository extends BaseRepository<
  GroupBase,
  Prisma.groupCreateInput,
  Prisma.groupUpdateInput,
  Prisma.groupWhereUniqueInput,
  Prisma.groupWhereInput,
  Prisma.groupFindUniqueArgs,
  Prisma.groupFindFirstArgs,
  Prisma.groupFindManyArgs,
  PrismaTransactionClient['group']
> {
  private constructor(model: PrismaTransactionClient['group'], principal: string) {
    super(model, principal, false);
  }

  static create(tx: PrismaTransactionClient, principal: string): GroupRepository {
    return new GroupRepository(tx.group, principal);
  }
}
