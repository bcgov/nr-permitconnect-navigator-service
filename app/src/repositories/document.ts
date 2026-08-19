import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class DocumentRepository extends WritableRepository<PrismaTransactionClient['document']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.document, principal, true);
  }
}
