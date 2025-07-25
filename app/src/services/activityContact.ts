import prisma from '../db/dataConnection';

import type { Contact } from '../types';

/**
 * Deletes activity_contact records that do not match the provided activityId and contacts
 * @param activityId
 * @param contacts
 */
export const deleteUnmatchedActivityContacts = async (activityId: string, contacts: Array<Contact>): Promise<void> => {
  const requestContactIds = contacts.map((c) => c.contactId);
  await prisma.activity_contact.deleteMany({
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
 * @param activityId
 * @param contacts
 */
export const upsertActivityContacts = async (activityId: string, contacts: Array<Contact>): Promise<void> => {
  return await prisma.$transaction(async (trx) => {
    await Promise.all(
      contacts.map(async (x: Contact) => {
        await trx.activity_contact.upsert({
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
  });
};
