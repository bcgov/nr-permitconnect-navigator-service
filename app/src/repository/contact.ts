import { Prisma } from '@prisma/client';

import { BaseRepository } from './base.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { Contact } from '../types/models.ts';

export class ContactRepository extends BaseRepository<
  Contact,
  Prisma.contactCreateInput,
  Prisma.contactUpdateInput,
  Prisma.contactWhereUniqueInput,
  Prisma.contactWhereInput,
  Prisma.contactFindUniqueArgs,
  Prisma.contactFindFirstArgs,
  Prisma.contactFindManyArgs,
  PrismaTransactionClient['contact']
> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.contact, principal);
  }
}
