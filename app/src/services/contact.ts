import prisma from '../db/dataConnection';
import { generateCreateStamps } from '../db/utils/utils';
import { Contact, ContactSearchParameters, CurrentContext } from '../types';

/**
 * @function deleteContact
 * Deletes a specific contact from the PCNS database
 * @param {string} contactId Contact ID
 */
export const deleteContact = async (contactId: string) => {
  await prisma.contact.delete({ where: { contactId } });
};

/**
 * Delete a contact
 * @param contactId - The ID of the contact to delete
 * @param includeActivities - Boolean flag indicated if associated acitivties are to be deleted
 * @returns A Promise that resolves to the deleted resource
 */
export const getContact = async (contactId: string, includeActivities: boolean): Promise<Contact> => {
  const result = await prisma.contact.findFirstOrThrow({
    where: { contactId },
    include: includeActivities ? { activityContact: { where: { activity: { isDeleted: false } } } } : {}
  });

  return result;
};

/**
 * @function insertContacts
 * Inserts multiple contacts into the database, generating IDs and timestamps automatically.
 * @param data - Array of Contact objects to insert
 * @param currentContext - Current context containing user information
 * @returns - {Promise<void>} The result of running the transaction
 *
 */

/**
 * Create multiple contacts
 * @param data - The contact objects to be created
 * @param currentContext - The Request context
 * @returns A promise that resolves when the operation is complete
 */
export const insertContacts = async (data: Array<Contact>, currentContext: CurrentContext): Promise<void> => {
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
};

/**
 * Retrieve all contacts matching any of the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the contacts matching the given params
 */
export const matchContacts = async (params: ContactSearchParameters): Promise<Contact[]> => {
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
};

/**
 * Retrieve all contacts matching the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the contacts matching the given params
 */
export const searchContacts = async (params: ContactSearchParameters): Promise<Contact[]> => {
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
};

/**
 * Creates or updates the given contacts
 * Generates IDs and timestamps automatically
 * @param data - The contact objects to create or update
 * @param currentContext - The Request context
 * @param activityId - The ID of the activity to associated the contacts with
 * @returns A promise that resolves when the operation is complete
 */
export const upsertContacts = async (
  data: Array<Contact>,
  currentContext: CurrentContext,
  activityId?: string
): Promise<void> => {
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
};
