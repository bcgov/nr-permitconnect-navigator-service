import prisma from '../db/dataConnection';

import type { ActivityContact, Contact } from '../types';
import activity_contact from '../db/models/activity_contact';

const service = {
  /**
   * @function searchActivityContacts
   * Searches activity_contact
   * @param {string} activityId The access request data to retrieve
   * @param {string} contactId The activity_contact data to retrieve
   * @returns {Promise<object>} The result of running the find operation
   */
  searchActivityContacts: async (params: { activityId?: string; contactId?: string[] }) => {
    const response = await prisma.activity_contact.findMany({
      where: {
        OR: [{ activity_id: params.activityId }, { contact_id: { in: params.contactId } }]
      }
    });
    return response ? response.map((x) => activity_contact.fromPrismaModel(x)) : null;
  },

  deleteActivityContacts: async (activityContacts: Array<ActivityContact>) => {
    const response = await prisma.$transaction(
      activityContacts.map((x) =>
        prisma.activity_contact.delete({
          where: {
            activity_id_contact_id: {
              activity_id: x.activityId,
              contact_id: x.contactId
            }
          }
        })
      )
    );
    return response ? response.map((x) => activity_contact.fromPrismaModel(x)) : null;
  },

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
              // Noop, required empty
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
