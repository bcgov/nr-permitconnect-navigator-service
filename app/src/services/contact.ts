import { unitOfWork } from '../repository/unitOfWork.ts';

import type { Contact, ContactBase, ContactSearchParameters } from '../types/index.ts';

/**
 * Deletes a specific contact from the PCNS database.
 * @param contactId - ID of the Contact to delete.
 * @returns A Promise that resolves when the operation is complete.
 */
export const deleteContactService = async (contactId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ contact }) => {
    await contact.delete({ contactId });
  });
};

/**
 * Gets a specific contact
 * @param contactId - The ID of the contact
 * @param includeActivities - Boolean flag indicated if associated activities are to be included
 * @returns A Promise that resolves to the contact
 */
export const getContactService = async (contactId: string, includeActivities: boolean): Promise<Contact> => {
  return await unitOfWork.execute(async ({ contact }) => {
    return await contact.findFirstOrThrow({
      where: { contactId },
      include: includeActivities ? { activityContact: { include: { activity: true } } } : {}
    });
  });
};

/**
 * Create multiple contacts
 * @param data - The contact objects to be created
 * @returns A promise that resolves when the operation is complete
 */
export const createContactsService = async (data: ContactBase[]): Promise<Contact[]> => {
  return await unitOfWork.execute(async ({ contact }) => {
    return await Promise.all(data.map(async (x: ContactBase) => contact.create(x)));
  });
};

/**
 * Retrieve all contacts matching any of the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the contacts matching the given params
 */
export const matchContactsService = async (params: ContactSearchParameters): Promise<Contact[]> => {
  return await unitOfWork.execute(async ({ contact }) => {
    return await contact.findMany({
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
          },
          {
            userId: { in: params.userId }
          }
        ]
      }
    });
  });
};

/**
 * Retrieve all contacts exactly matching any of the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the contacts matching the given params and are users
 */
export const matchContactsExactService = async (params: ContactSearchParameters): Promise<Contact[]> => {
  return await unitOfWork.execute(async ({ contact }) => {
    return await contact.findMany({
      where: {
        OR: [
          {
            contactId: { in: params.contactId }
          },
          {
            userId: { in: params.userId }
          },
          {
            email: params.email ?? { in: params.email, mode: 'insensitive' }
          }
        ],
        userId: { not: null }
      },
      include: {
        user: true
      }
    });
  });
};

/**
 * Retrieve all contacts matching the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the contacts matching the given params
 */
export const searchContactsService = async (params: ContactSearchParameters): Promise<Contact[]> => {
  return await unitOfWork.execute(async ({ contact }) => {
    return await contact.findMany({
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
        user: true,
        ...(params.includeActivities ? { activityContact: { include: { activity: true } } } : {})
      }
    });
  });
};

/**
 * Creates or updates the given contacts
 * @param data - The contact objects to create or update
 * @returns A promise that resolves when the operation is complete
 */
export const upsertContactsService = async (data: ContactBase[]): Promise<Contact[]> => {
  return await unitOfWork.execute(async ({ contact }) => {
    return await Promise.all(data.map(async (x: ContactBase) => contact.upsert({ contactId: x.contactId }, x, x)));
  });
};
