import prisma from '../db/dataConnection';
import { generateCreateStamps } from '../db/utils/utils';
import { Contact, ContactSearchParameters, CurrentContext } from '../types';

const service = {
  /**
   * @function deleteContact
   * Deletes a specific contact from the PCNS database
   * @param {string} contactId Contact ID
   */
  deleteContact: async (contactId: string) => {
    await prisma.contact.delete({ where: { contactId } });
  },

  /**
   * @function getContact
   * Gets a specific contact from the PCNS database
   * @param {string} contactId Contact ID
   * @param {boolean} includeActivities Whether to include associated activities
   * @returns {Promise<Contact | null>} The result of running the findFirst operation
   */
  getContact: async (contactId: string, includeActivities: boolean) => {
    const result = await prisma.contact.findFirst({
      where: { contactId },
      include: includeActivities ? { activityContact: { where: { activity: { isDeleted: false } } } } : {}
    });

    if (!result) return null;

    return result;
  },

  /**
   * @function insertContacts
   * Inserts multiple contacts into the database, generating IDs and timestamps automatically.
   * @param data - Array of Contact objects to insert
   * @param currentContext - Current context containing user information
   * @returns - {Promise<void>} The result of running the transaction
   *
   */
  insertContacts: async (data: Array<Contact>, currentContext: CurrentContext) => {
    return await prisma.$transaction(async (trx) => {
      await Promise.all(
        data.map(async (x: Contact) => {
          await trx.contact.create({
            data: {
              ...x,
              ...generateCreateStamps(currentContext)
            }
          });
        })
      );
    });
  },

  /**
   * @function matchContacts
   * Find contacts that match any of the given parameters
   * @param {string} [email] Optional email string to match on
   * @param {string} [phoneNumber] Optional phoneNumber string to match on
   * @param {string} [firstName] Optional firstName string to match on
   * @param {string} [lastName] Optional lastName string to match on
   * @returns {Promise<object>} The result of running the findMany operation
   */
  matchContacts: async (params: ContactSearchParameters) => {
    const response = await prisma.contact.findMany({
      where: {
        OR: [
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
          }
        ]
      }
    });

    return response;
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
   * @param {Initiative} [params.initiative] Optional Initiative to match on
   * @param {boolean} [params.includeActivities] Optional boolean for whether to include activities
   * @returns {Promise<object>} The result of running the findMany operation
   */
  searchContacts: async (params: ContactSearchParameters): Promise<Array<Contact>> => {
    const response = await prisma.contact.findMany({
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
        user: {
          select: {
            bceidBusinessName: true
          }
        },
        ...(params.includeActivities ? { activity_contact: { where: { activity: { is_deleted: false } } } } : {})
      }
    });

    if (!response || response.length === 0) return [];

    return response;
  },

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
            where: { contactId: x.contactId },
            update: x,
            create: x
          });

          if (activityId) {
            await trx.activity_contact.upsert({
              where: {
                activityId_contactId: {
                  activityId: activityId,
                  contactId: response?.contactId ?? x.contactId
                }
              },
              update: {
                // Noop, required empty
              },
              create: {
                activityId,
                contactId: response?.contactId ?? x.contactId
              }
            });
          }
        })
      );
    });
  }
};

export default service;
