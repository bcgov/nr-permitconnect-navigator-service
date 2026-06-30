import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import { ContactSearchParameters } from '../types/stuff';

export class ContactRepository extends WritableRepository<PrismaTransactionClient['contact']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.contact, principal);
  }

  public async search(params: ContactSearchParameters) {
    return await this.model.findMany({
      where: {
        AND: [
          {
            contactId: { in: params.contactId }
          },
          {
            userId: { in: params.userId }
          },
          {
            contactApplicantRelationship: { contains: params.contactApplicantRelationship, mode: 'insensitive' }
          },
          {
            contactPreference: { contains: params.contactPreference, mode: 'insensitive' }
          },
          {
            email: { contains: params.email, mode: 'insensitive' }
          },
          {
            firstName: { contains: params.firstName, mode: 'insensitive' }
          },
          {
            lastName: { contains: params.lastName, mode: 'insensitive' }
          },
          {
            phoneNumber: { contains: params.phoneNumber, mode: 'insensitive' }
          },
          ...(params.initiative
            ? [{ activityContact: { some: { activity: { initiative: { code: params.initiative } } } } }]
            : [])
        ]
      },
      include: {
        user: true,
        ...(params.includeActivities ? { activityContact: { include: { activity: true } } } : {})
      }
    });
  }
}
