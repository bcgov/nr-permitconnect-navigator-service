import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class IdentityProviderRepository extends WritableRepository<PrismaTransactionClient['identity_provider']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.identity_provider, principal);
  }
}
