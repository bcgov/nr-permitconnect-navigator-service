import prisma from '../db/dataConnection';
import { generateCreateStamps } from '../db/utils/utils';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Contact, ContactSearchParameters, CurrentContext } from '../types';

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
    include: includeActivities ? { activityContact: { where: { activity: { isDeleted: false } } } } : {}
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
  data: Array<Contact>,
  currentContext: CurrentContext
): Promise<void> => {
  // TODO-PR: Rewrite service call to use tx client param, move transaction up to controller layer.
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
      user: {
        select: {
          bceidBusinessName: true
        }
      },
      ...(params.includeActivities ? { activityContact: { where: { activity: { isDeleted: false } } } } : {})
    }
  });

  if (!response || response.length === 0) return [];

  return response;
};

/**
 * Creates or updates the given contacts
 * @param tx Prisma transaction client
 * @param data - The contact objects to create or update
 * @param activityId - The ID of the activity to associated the contacts with
 * @returns A promise that resolves when the operation is complete
 */
export const upsertContacts = async (tx: PrismaTransactionClient, data: Array<Contact>): Promise<Contact[]> => {
  // TODO-PR: Rewrite service call to use tx client param, move transaction up to controller layer.
  return await prisma.$transaction(async (trx) => {
    return await Promise.all(
      data.map(async (x: Contact) => {
        const response = await trx.contact.upsert({
          where: { contactId: x.contactId },
          update: x,
          create: x
        });

        return response;
      })
    );
  });
};
