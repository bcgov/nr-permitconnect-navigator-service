import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';
import { contact } from '../db/models';
import { generateCreateStamps } from '../db/utils/utils';
import { Contact, CurrentContext } from '../types';

const service = {
  /**
   * @function upsertContacts
   * Creates or updates the given contacts
   * Generates IDs and timestamps automatically
   * @returns {Promise<void>} The result of running the transaction
   */
  upsertContacts: async (activityId: string, data: Array<Contact>, currentContext: CurrentContext) => {
    return await prisma.$transaction(async (trx) => {
      await Promise.all(
        data.map(async (x: Contact) => {
          if (!x.contactId) {
            const response = await trx.contact.create({
              data: contact.toPrismaModel({
                ...x,
                contactId: uuidv4(),
                ...generateCreateStamps(currentContext)
              })
            });

            await trx.activity_contact.create({
              data: {
                activity_id: activityId,
                contact_id: response.contact_id
              }
            });
          } else {
            await trx.contact.update({
              data: contact.toPrismaModel({ ...x, ...generateCreateStamps(currentContext) }),
              where: {
                contact_id: x.contactId
              }
            });
          }
        })
      );
    });
  }
};

export default service;
