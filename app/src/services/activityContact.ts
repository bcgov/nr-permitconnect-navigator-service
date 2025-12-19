import { ActivityContactRole } from '../utils/enums/projectCommon.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { ActivityContact } from '../types/index.ts';

/**
 * Create an activity_contact record
 * @param tx Prisma transaction client
 * @param activityId The activity ID the contact is associated to
 * @param contactId The contact ID to associate
 * @param role The contacts role
 * @returns A Promise that resolves to the created resource
 */
export const createActivityContact = async (
  tx: PrismaTransactionClient,
  activityId: string,
  contactId: string,
  role: ActivityContactRole
): Promise<ActivityContact> => {
  return await tx.activity_contact.create({
    data: {
      activityId,
      contactId,
      role
    },
    include: { contact: true }
  });
};

/**
 * Delete an activity_contact record
 * @param tx Prisma transaction client
 * @param activityId The activity ID the contact is associated to
 * @param contactId The contact ID to remove
 */
export const deleteActivityContact = async (
  tx: PrismaTransactionClient,
  activityId: string,
  contactId: string
): Promise<void> => {
  await tx.activity_contact.delete({
    where: {
      activityId_contactId: {
        activityId,
        contactId
      }
    }
  });
};

/**
 * Get a specific activity_contact record
 * @param tx Prisma transaction client
 * @param activityId The activity ID
 * @param contactId The contact ID
 * @returns A Promise that resolves to an array of ActivityContacts
 */
export const getActivityContact = async (
  tx: PrismaTransactionClient,
  activityId: string,
  contactId: string
): Promise<ActivityContact> => {
  return await tx.activity_contact.findFirstOrThrow({
    where: {
      activityId: activityId,
      contactId: contactId
    },
    include: { contact: true }
  });
};

/**
 * Gets activity_contact records that match the provided activityId
 * @param tx Prisma transaction client
 * @param activityId The activity ID
 * @returns A Promise that resolves to an array of ActivityContacts
 */
export const listActivityContacts = async (
  tx: PrismaTransactionClient,
  activityId: string
): Promise<ActivityContact[]> => {
  return await tx.activity_contact.findMany({
    where: {
      activityId: activityId
    },
    include: { contact: true }
  });
};

/**
 * Update an activity_contact record
 * @param tx Prisma transaction client
 * @param activityId The activity ID the contact is associated to
 * @param contactId The contact ID to update
 * @param role The contacts role
 * @returns A Promise that resolves to the created resource
 */
export const updateActivityContact = async (
  tx: PrismaTransactionClient,
  activityId: string,
  contactId: string,
  role: ActivityContactRole
): Promise<ActivityContact> => {
  return await tx.activity_contact.update({
    data: {
      role
    },
    where: {
      activityId_contactId: {
        activityId,
        contactId
      }
    },
    include: { contact: true }
  });
};
