import prisma from '../db/dataConnection';
import { contact } from '../db/models';
import { Contact } from '../types';

const service = {
  /**
   * @function createContact
   * Create a contact for an activity
   * @returns {Promise<Contact>} The result of running the create operation
   */
  createContact: async (activityId: string, data: Contact) => {
    const response = await prisma.$transaction(async (trx) => {
      const contactResponse = await trx.contact.create({
        data: contact.toPrismaModel(data)
      });

      await trx.activity_contact.create({
        data: {
          activity_id: activityId,
          contact_id: contactResponse.contact_id
        }
      });

      return contactResponse;
    });

    return contact.fromPrismaModel(response);
  },

  /**
   * @function updateContact
   * Update a contact for an activity
   * @returns {Promise<Contact>} The result of running the update operation
   */
  updateContact: async (data: Contact) => {
    const response = await prisma.contact.update({
      data: contact.toPrismaModel(data),
      where: {
        contact_id: data.contactId
      }
    });

    return contact.fromPrismaModel(response);
  }
};

export default service;
