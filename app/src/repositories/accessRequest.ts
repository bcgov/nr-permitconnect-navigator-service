import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class AccessRequestRepository extends WritableRepository<PrismaTransactionClient['access_request']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.access_request, principal);
  }
}
