import prisma from '../db/dataConnection';
import { contact } from '../db/models';
import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { Contact, ContactSearchParameters, CurrentContext } from '../types';

const service = {
  /**
   * @function upsertContacts
   * Creates or updates the given contacts
   * Generates IDs and timestamps automatically
   * @returns {Promise<void>} The result of running the transaction
   */
  upsertContacts: async (data: Array<Contact>, currentContext: CurrentContext, activityId?: string) => {
    return await prisma.$transaction(async (trx) => {
      await Promise.all(
        data.map(async (x: Contact) => {
          const response = await trx.contact.upsert({
            where: {
              contact_id: x.contactId
            },
            update: {
              ...contact.toPrismaModel({ ...x, ...generateUpdateStamps(currentContext) })
            },
            create: {
              ...contact.toPrismaModel({
                ...x,
                ...generateCreateStamps(currentContext)
              })
            }
          });

          if (activityId) {
            await trx.activity_contact.upsert({
              where: {
                activity_id_contact_id: {
                  activity_id: activityId,
                  contact_id: response?.contact_id ?? x.contactId
                }
              },
              update: {
                // Noop, required empty
              },
              create: {
                activity_id: activityId,
                contact_id: response?.contact_id ?? x.contactId
              }
            });
          }
        })
      );
    });
  },

  /**
   * @function searchContacts
   * Search and filter for specific users
   * @param {string[]} [params.contactId] Optional array of uuids representing the contact subject
   * @param {string[]} [params.userId] Optional array of uuids representing the user subject
   * @param {string} [params.email] Optional email string to match on
   * @param {string} [params.phoneNumber] Optional phoneNumber string to match on
   * @param {string} [params.firstName] Optional firstName string to match on
   * @param {string} [params.contactApplicantRelationship] Optional contactApplicantRelationship string to match on
   * @param {string} [params.lastName] Optional lastName string to match on
   * @param {boolean} [params.contactPreference] Optional contactPreference string to match on
   * @returns {Promise<object>} The result of running the findMany operation
   */
  searchContacts: async (params: ContactSearchParameters) => {
    const response = await prisma.contact.findMany({
      where: {
        AND: [
          {
            contact_id: { in: params.contactId }
          },
          {
            user_id: { in: params.userId }
          },
          {
            contact_applicant_relationship: { contains: params.contactApplicantRelationship, mode: 'insensitive' }
          },
          {
            contact_preference: { contains: params.contactPreference, mode: 'insensitive' }
          },
          {
            email: { contains: params.email, mode: 'insensitive' }
          },
          {
            first_name: { contains: params.firstName, mode: 'insensitive' }
          },
          {
            last_name: { contains: params.lastName, mode: 'insensitive' }
          },
          {
            phone_number: { contains: params.phoneNumber, mode: 'insensitive' }
          }
        ]
      }
    });

    return response ? response.map((x) => contact.fromPrismaModel(x)) : [];
  }
};

export default service;
