import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class PermitTrackingRepository extends WritableRepository<PrismaTransactionClient['permit_tracking']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.permit_tracking, principal);
  }
}
