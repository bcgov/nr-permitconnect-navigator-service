import { ActivityContactRole } from '../utils/enums/projectCommon';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ActivityContact } from '../types';

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
