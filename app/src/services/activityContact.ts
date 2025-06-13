import prisma from '../db/dataConnection';

import type { Contact } from '../types';
import activity_contact from '../db/models/activity_contact';

const service = {
  /**
   * Deletes activity_contact records that do not match the provided activityId and contacts
   * @param activityId
   * @param contacts
   */

  deleteUnmatchedActivityContacts: async (activityId: string, contacts: Array<Contact>) => {
    const requestContactIds = contacts.map((c) => c.contactId);
    await prisma.activity_contact.deleteMany({
      where: {
        activity_id: activityId,
        contact_id: {
          notIn: requestContactIds
        }
      }
    });
  },

  /**
   * Upserts activity_contact records for the given activityId and contacts
   * @param activityId
   * @param contacts
   */
  upsertActivityContacts: async (activityId: string, contacts: Array<Contact>) => {
    return await prisma.$transaction(async (trx) => {
      await Promise.all(
        contacts.map(async (x: Contact) => {
          await trx.activity_contact.upsert({
            where: {
              activity_id_contact_id: {
                activity_id: activityId,
                contact_id: x.contactId
              }
            },
            update: {
              ...activity_contact.toPrismaModel({
                activityId: activityId,
                contactId: x.contactId
              })
            },
            create: {
              ...activity_contact.toPrismaModel({
                activityId: activityId,
                contactId: x.contactId
              })
            }
          });
        })
      );
    });
  }
};

export default service;
