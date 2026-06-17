import { Prisma } from '@prisma/client';

import { BaseRepository } from './base.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { IdentityProvider } from '../types/models.ts';

export class IdentityProviderRepository extends BaseRepository<
  IdentityProvider,
  Prisma.identity_providerCreateInput,
  Prisma.identity_providerUpdateInput,
  Prisma.identity_providerWhereUniqueInput,
  Prisma.identity_providerWhereInput,
  Prisma.identity_providerFindUniqueArgs,
  Prisma.identity_providerFindFirstArgs,
  Prisma.identity_providerFindManyArgs,
  PrismaTransactionClient['identity_provider']
> {
  private constructor(model: PrismaTransactionClient['identity_provider'], principal: string) {
    super(model, principal, false);
  }

  static create(tx: PrismaTransactionClient, principal: string): IdentityProviderRepository {
    return new IdentityProviderRepository(tx.identity_provider, principal);
  }
}
