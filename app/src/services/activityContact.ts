import { ActivityContactRole } from '../utils/enums/projectCommon';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ActivityContact, Contact } from '../types';

/**
 * Deletes activity_contact records that do not match the provided activityId and contacts
 * @param tx Prisma transaction client
 * @param activityId The activity ID the contacts are associated to
 * @param contacts Array of contacts to keep
 */
export const deleteUnmatchedActivityContacts = async (
  tx: PrismaTransactionClient,
  activityId: string,
  contacts: Array<Contact>
): Promise<void> => {
  const requestContactIds = contacts.map((c) => c.contactId);
  await tx.activity_contact.deleteMany({
    where: {
      activityId: activityId,
      contactId: {
        notIn: requestContactIds
      }
    }
  });
};

/**
 * Gets activity_contact records that match the provided activityId
 * @param tx Prisma transaction client
 * @param activityId The activity ID
 * @returns A Promise that resolves to an array of ActivityContacts
 */
export const getActivityContacts = async (
  tx: PrismaTransactionClient,
  activityId: string
): Promise<ActivityContact[]> => {
  return await tx.activity_contact.findMany({
    where: {
      activityId: activityId
    }
  });
};

/**
 * Upserts activity_contact records for the given activityId and contacts
 * @param tx Prisma transaction client
 * @param activityId The activity ID the contacts are associated to
 * @param contacts Array of contacts to create/update
 * @returns A Promise that resolves to an array of the created/updated ActivityContacts
 */
export const upsertActivityContacts = async (
  tx: PrismaTransactionClient,
  activityId: string,
  contacts: Array<Contact>,
  role: ActivityContactRole = ActivityContactRole.MEMBER
): Promise<ActivityContact[]> => {
  return await Promise.all(
    contacts.map(async (x: Contact) => {
      return await tx.activity_contact.upsert({
        where: {
          activityId_contactId: {
            activityId: activityId,
            contactId: x.contactId
          }
        },
        update: {
          activityId: activityId,
          contactId: x.contactId,
          role: role
        },
        create: {
          activityId: activityId,
          contactId: x.contactId,
          role: role
        }
      });
    })
  );
};
