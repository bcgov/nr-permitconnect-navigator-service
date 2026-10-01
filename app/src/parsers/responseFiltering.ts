import { Problem } from '#src/utils/index';

import type { Repositories } from '#src/db/unitOfWork';
import type { CurrentAuthorization, CurrentContext } from '#types';

interface ActivityScopeFilterable {
  activityId?: string;
  activity?: {
    activityContact?: {
      contactId: string;
    }[];
  };
}

/**
 * Resolves the user ID to scope DB queries to when the current authorization is scope:self
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @returns The user ID for scope:self, otherwise undefined
 * @throws {Problem} 403 when scope:self but no user ID, as an unscoped query would return everything
 */
export const getScopeUserId = (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): string | undefined => {
  if (!currentAuthorization?.attributes.includes('scope:self')) return undefined;

  if (!currentContext?.userId) {
    throw new Problem(403, { detail: 'Unable to determine user' });
  }

  return currentContext.userId;
};

const hasContactAccess = (contacts: { contactId: string }[] | undefined, currentContactId: string) =>
  contacts?.some((c) => c.contactId === currentContactId) ?? false;

export const filterActivityResponseByScope = async <T extends ActivityScopeFilterable>(
  repositories: Pick<Repositories, 'activityContact' | 'contact'>,
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  data: T[]
): Promise<T[]> => {
  if (!currentAuthorization?.attributes.includes('scope:self')) {
    return data;
  }

  const [contact] = await repositories.contact.findMany({
    where: {
      userId: { in: [currentContext.userId as string] }
    }
  });

  if (!contact) {
    throw new Problem(403, {
      detail: 'Unable to determine contact'
    });
  }

  const currentContactId = contact.contactId;

  const activityIds = [
    ...new Set(
      data
        .filter((item) => item.activity?.activityContact === undefined && item.activityId)
        .map((item) => item.activityId!)
    )
  ];

  const activityContacts =
    activityIds.length > 0
      ? await repositories.activityContact.findMany({
          where: {
            activityId: { in: activityIds }
          },
          include: { contact: true }
        })
      : [];

  const contactsByActivityId = new Map<string, { contactId: string }[]>();

  for (const activityContact of activityContacts) {
    const contacts = contactsByActivityId.get(activityContact.activityId) ?? [];

    contacts.push({
      contactId: activityContact.contactId
    });

    contactsByActivityId.set(activityContact.activityId, contacts);
  }

  const hasAccess = (item: T): boolean => {
    // Activity contacts were already loaded; use them
    if (item.activity?.activityContact) {
      return hasContactAccess(item.activity.activityContact, currentContactId);
    }

    // Activity contacts were not loaded; resolve via activityId
    if (item.activityId) {
      return hasContactAccess(contactsByActivityId.get(item.activityId), currentContactId);
    }

    // Cannot determine access -> deny
    return false;
  };

  return data.filter(hasAccess);
};
