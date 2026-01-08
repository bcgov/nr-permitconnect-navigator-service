import { searchContacts } from '../contact';
import { Problem } from '../../utils';
import { PrismaTransactionClient } from '../../db/dataConnection';
import { ActivityContactRole } from '../../utils/enums/projectCommon';
import { listActivityContacts, updateActivityContact } from '../activityContact';

/**
 * Only allows either the existing PRIMARY user of an activity, or a user authorized with scope:all
 *   to hand off the PRIMARY to a new contact
 * This function will change the current PRIMARY's role to ADMIN
 * Needs to be called BEFORE the new PRIMARY role is given
 * Exported only for testing purposes
 * @param tx Prisma transaction client
 * @param currentAuthorizationAttributes - The attributes of the current authorized user
 * @param currentUserId - The ID of the current authorized user
 * @param activityId - The activity ID given in the request
 * @param requestedRole - The requested role of the new contact given in the request
 */
export const validatePrimaryChange = async (
  tx: PrismaTransactionClient,
  currentAuthorizationAttributes: string[],
  currentUserId: string | undefined,
  activityId: string,
  requestedRole: ActivityContactRole
) => {
  if (requestedRole === ActivityContactRole.PRIMARY) {
    const currentUserContact = await searchContacts(tx, { userId: [currentUserId as string] });
    const activityContacts = await listActivityContacts(tx, activityId);
    const currentUserActivityContact = activityContacts.find((ac) => ac.contactId === currentUserContact[0].contactId);
    const currentPrimaryActivityContact = activityContacts.find((ac) => ac.role === ActivityContactRole.PRIMARY);

    // Current user scope and role check
    if (
      !currentAuthorizationAttributes.includes('scope:all') &&
      (!currentUserActivityContact ||
        (currentUserActivityContact &&
          (currentUserActivityContact.role as ActivityContactRole) !== ActivityContactRole.PRIMARY))
    ) {
      throw new Problem(403, { detail: 'User lacks required role.' });
    }

    // Update current PRIMARY to ADMIN if necessary
    if (currentPrimaryActivityContact)
      await updateActivityContact(tx, activityId, currentPrimaryActivityContact.contactId, ActivityContactRole.ADMIN);
  }
};
