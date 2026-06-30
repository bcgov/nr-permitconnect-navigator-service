import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class DocumentRepository extends WritableRepository<PrismaTransactionClient['document']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.document, principal, true);
  }
}
