import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { Contact, DeleteContactRequest, GetContactRequest, ListContactsRequest, PutContactRequest } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const contactRoute = createRouteBuilder('contact');

const contactRoutes = {
  root: () => contactRoute(),
  byId: (contactId: string) => contactRoute(contactId),

  match: () => contactRoute('match'),
  search: () => contactRoute('search')
} as const;

/**
 * Retrieves a specific contact.
 * @param req - The request payload containing the contact ID and optional activity inclusion flag.
 * @returns A promise resolving to the requested `Contact` resource.
 */
export function getContact(req: GetContactRequest): Promise<Contact> {
  const { contactId, includeActivities = false } = req;

  return api.get<Contact>(contactRoutes.byId(contactId), {
    params: { includeActivities }
  });
}

/**
 * Retrieves the current user's contact details.
 * @returns A promise resolving to the current user's `Contact` resource.
 */
export function getCurrentUserContact(): Promise<Contact> {
  return api.get<Contact>(contactRoutes.root());
}

/**
 * Deletes a specific contact.
 * @param req - The request payload containing the contact ID.
 * @returns A promise resolving when the operation completes.
 */
export function deleteContact(req: DeleteContactRequest): Promise<void> {
  const { contactId } = req;

  return api.delete(contactRoutes.byId(contactId));
}

/**
 * Returns contacts matching the supplied criteria.
 * @param req - The request payload containing matching criteria.
 * @returns A promise resolving to an array of matching `Contact` resources.
 */
export function matchContacts(req: ListContactsRequest): Promise<Contact[]> {
  return api.post<Contact[]>(contactRoutes.match(), req);
}

/**
 * Searches contacts using the supplied filters.
 * @param req - The request payload containing search criteria.
 * @returns A promise resolving to an array of `Contact` resources.
 */
export function searchContacts(req: ListContactsRequest): Promise<Contact[]> {
  return api.post<Contact[]>(contactRoutes.search(), req);
}

/**
 * Updates the current contact.
 * @param req - The request payload containing updated contact data.
 * @returns A promise resolving to the updated `Contact` resource.
 */
export function putContact(req: PutContactRequest): Promise<Contact> {
  return api.put<Contact>(contactRoutes.root(), req);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const contactService = {
  getContact,
  getCurrentUserContact,
  deleteContact,
  matchContacts,
  searchContacts,
  putContact
};
