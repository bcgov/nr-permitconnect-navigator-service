import { PrismaTransactionClient } from '../../db/database';

import type { Contact, ContactSearchParameters } from '../../types';

export const searchContacts = async (
  tx: PrismaTransactionClient,
  params: ContactSearchParameters
): Promise<Contact[]> => {
  const response = await tx.contact.findMany({
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

  return response;
};
