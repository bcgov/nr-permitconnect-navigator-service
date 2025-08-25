import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ActivityContact, Contact } from '../types';

/**
 * Deletes activity_contact records that do not match the provided activityId and contacts
 * @param tx Prisma transaction client
 * @param activityId
 * @param contacts
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
 * Upserts activity_contact records for the given activityId and contacts
 * @param tx Prisma transaction client
 * @param activityId
 * @param contacts
 */
export const upsertActivityContacts = async (
  tx: PrismaTransactionClient,
  activityId: string,
  contacts: Array<Contact>
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
          contactId: x.contactId
        },
        create: {
          activityId: activityId,
          contactId: x.contactId
        }
      });
    })
  );
};
