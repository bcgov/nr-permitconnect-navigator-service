import { generateCreateStamps } from '../db/utils/utils.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Contact, ContactBase, ContactSearchParameters, CurrentContext } from '../types/index.ts';

/**
 * Deletes a specific contact from the PCNS database
 * @param tx Prisma transaction client
 * @param contactId Contact ID
 */
export const deleteContact = async (tx: PrismaTransactionClient, contactId: string): Promise<void> => {
  await tx.contact.delete({ where: { contactId } });
};

/**
 * Gets a specific contact
 * @param tx Prisma transaction client
 * @param contactId - The ID of the contact
 * @param includeActivities - Boolean flag indicated if associated activities are to be included
 * @returns A Promise that resolves to the contact
 */
export const getContact = async (
  tx: PrismaTransactionClient,
  contactId: string,
  includeActivities: boolean
): Promise<Contact> => {
  const result = await tx.contact.findFirstOrThrow({
    where: { contactId },
    include: includeActivities ? { activityContact: { include: { activity: true } } } : {}
  });

  return result;
};

/**
 * Create multiple contacts
 * @param tx Prisma transaction client
 * @param data - The contact objects to be created
 * @param currentContext - The Request context
 * @returns A promise that resolves when the operation is complete
 */
export const insertContacts = async (
  tx: PrismaTransactionClient,
  data: ContactBase[],
  currentContext: CurrentContext
): Promise<Contact[]> => {
  return await Promise.all(
    data.map(async (x: ContactBase) => {
      return await tx.contact.create({
        data: {
          ...x,
          ...generateCreateStamps(currentContext)
        }
      });
    })
  );
};

/**
 * Retrieve all contacts matching any of the search parameters
 * @param tx Prisma transaction client
 * @param params - The search parameters
 * @returns A Promise that resolves to the contacts matching the given params
 */
export const matchContacts = async (
  tx: PrismaTransactionClient,
  params: ContactSearchParameters
): Promise<Contact[]> => {
  const response = await tx.contact.findMany({
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
 * @param tx Prisma transaction client
 * @param params - The search parameters
 * @returns A Promise that resolves to the contacts matching the given params
 */
export const searchContacts = async (
  tx: PrismaTransactionClient,
  params: ContactSearchParameters
): Promise<Contact[]> => {
  const response = await tx.contact.findMany({
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

  return response;
};

/**
 * Creates or updates the given contacts
 * @param tx Prisma transaction client
 * @param data - The contact objects to create or update
 * @returns A promise that resolves when the operation is complete
 */
export const upsertContacts = async (tx: PrismaTransactionClient, data: ContactBase[]): Promise<Contact[]> => {
  return await Promise.all(
    data.map(async (x: ContactBase) => {
      return await tx.contact.upsert({
        where: { contactId: x.contactId },
        update: x,
        create: x
      });
    })
  );
};
