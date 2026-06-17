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
  private constructor(model: PrismaTransactionClient['contact'], principal: string) {
    super(model, principal, false);
  }

  static create(tx: PrismaTransactionClient, principal: string): ContactRepository {
    return new ContactRepository(tx.contact, principal);
  }
}
