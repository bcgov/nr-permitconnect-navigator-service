import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type {
  ActivityContact,
  CreateActivityContactRequest,
  DeleteActivityContactRequest,
  ListActivityContactsRequest,
  PutActivityContactRequest,
  PutActivityContactResponse
} from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const activityRoute = createRouteBuilder('activity');

const activityRoutes = {
  contacts: {
    list: (activityId: string) => activityRoute(activityId, 'contact'),
    byId: (activityId: string, contactId: string) => activityRoute(activityId, 'contact', contactId)
  }
} as const;

/**
 * Creates a contact association for an activity.
 * @param req - The request payload containing path parameters and the contact role.
 * @returns A promise resolving to the created `ActivityContact` resource.
 */
export async function createActivityContact(req: CreateActivityContactRequest): Promise<ActivityContact> {
  const { activityId, contactId, ...body } = req;

  return api.post<ActivityContact>(activityRoutes.contacts.byId(activityId, contactId), body);
}

/**
 * Deletes a contact association from an activity.
 * @param req - The request payload containing the compound key for deletion.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteActivityContact(req: DeleteActivityContactRequest): Promise<void> {
  const { activityId, contactId } = req;

  return api.delete(activityRoutes.contacts.byId(activityId, contactId));
}

/**
 * Retrieves all contacts associated with a specific activity.
 * @param activityId - The ID of the activity to list contacts for.
 * @returns A promise resolving to an array of `ActivityContact` resources.
 */
export async function listActivityContacts(req: ListActivityContactsRequest): Promise<ActivityContact[]> {
  const { activityId } = req;

  return api.get<ActivityContact[]>(activityRoutes.contacts.list(activityId));
}

/**
 * Updates a contact association for an activity.
 * @param req - The request payload containing path parameters and updatable fields.
 * @returns A promise resolving to the updated `ActivityContact` and any optionally demoted contact.
 */
export async function putActivityContact(req: PutActivityContactRequest): Promise<PutActivityContactResponse> {
  const { activityId, contactId, ...body } = req;

  return api.put<PutActivityContactResponse>(activityRoutes.contacts.byId(activityId, contactId), body);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const activityContactService = {
  createActivityContact,
  putActivityContact,
  deleteActivityContact,
  listActivityContacts
};
