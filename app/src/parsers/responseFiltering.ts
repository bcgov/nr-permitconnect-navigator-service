import { PrismaTransactionClient } from '../db/database';
import { listActivityContacts } from '../services/activityContact';
import { LocalContext } from '../types';
import { Problem } from '../utils';

interface ActivityScopeFilterable {
  activityId?: string;
  activity?: {
    activityContact?: {
      contactId: string;
    }[];
  };
}

const hasContactAccess = (contacts: { contactId: string }[] | undefined, currentContactId: string) =>
  contacts?.some((c) => c.contactId === currentContactId) ?? false;

export const filterActivityResponseByScope = async <T extends ActivityScopeFilterable>(
  tx: PrismaTransactionClient,
  locals: LocalContext,
  data: T[]
): Promise<T[]> => {
  if (!locals.currentAuthorization?.attributes.includes('scope:self')) {
    return data;
  }

  const [contact] = await tx.contact.findMany({
    where: {
      userId: { in: [locals.currentContext.userId as string] }
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

  const activityContacts = activityIds.length > 0 ? await listActivityContacts(tx, activityIds) : [];

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
