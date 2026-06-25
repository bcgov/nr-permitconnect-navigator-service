import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class IdentityProviderRepository extends WritableRepository<PrismaTransactionClient['identity_provider']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.identity_provider, principal);
  }
}
