import { listActivityContacts, updateActivityContact } from '../activityContact';
import { searchContacts } from '../contact';
import { PrismaTransactionClient } from '../../db/dataConnection';
import { Problem } from '../../utils';
import { GroupName } from '../../utils/enums/application';
import { ActivityContactRole } from '../../utils/enums/projectCommon';

import type { ActivityContact, CurrentAuthorization, CurrentContext } from '../../types';

const NAVIGATOR_GROUPS = new Set([GroupName.ADMIN, GroupName.NAVIGATOR, GroupName.SUPERVISOR]);

/**
 * Only allows either the existing PRIMARY user of an activity, a navigator, or a user authorized with scope:all
 *   to hand off the PRIMARY to a new contact
 * This function will change the current PRIMARY's role to ADMIN
 * Needs to be called BEFORE the new PRIMARY role is given
 * @param tx Prisma transaction client
 * @param activityId - The activity ID given in the request
 * @param currentAuthorization - The authorization of the current authorized user
 * @param currentContext - The context of the current authorized user
 * @returns A promise resolving to the previous PRIMARY activity contact, or undefined if none was demoted.
 */
export const verifyPrimaryChange = async (
  tx: PrismaTransactionClient,
  activityId: string,
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): Promise<ActivityContact | undefined> => {
  const activityContacts = await listActivityContacts(tx, activityId);

  // Current user scope check
  if (!currentAuthorization.attributes.includes('scope:all')) {
    const currentUserContact = await searchContacts(tx, { userId: [currentContext.userId as string] });
    const currentUserActivityContact = activityContacts.find((ac) => ac.contactId === currentUserContact[0].contactId);

    // Check if current user is a primary contact or navigator.
    const userIsPrimaryContact = currentUserActivityContact?.role === ActivityContactRole.PRIMARY;
    const userIsNavigator = currentAuthorization.groups.some(
      (g) => g.initiativeCode === currentContext.initiative && NAVIGATOR_GROUPS.has(g.name)
    );

    if (!userIsPrimaryContact && !userIsNavigator) {
      throw new Problem(403, { detail: 'User lacks required role.' });
    }
  }

  // If necessary, update current PRIMARY activity contact to ADMIN and return
  const currentPrimaryActivityContact = activityContacts.find((ac) => ac.role === ActivityContactRole.PRIMARY);
  if (currentPrimaryActivityContact) {
    return await updateActivityContact(
      tx,
      activityId,
      currentPrimaryActivityContact.contactId,
      ActivityContactRole.ADMIN
    );
  }

  return undefined;
};
