import { Prisma } from '@prisma/client';

import { BaseRepository } from '../base.ts';

import type { PrismaTransactionClient } from '../../db/database.ts';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const group = Prisma.validator<Prisma.groupDefaultArgs>()({});
type GroupBase = Prisma.groupGetPayload<typeof group>;

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
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.group, principal);
  }
}
