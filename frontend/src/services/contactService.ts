import { appAxios } from './interceptors';

import type { Contact, DeleteContactRequest, GetContactRequest, ListContactsRequest, PutContactRequest } from '@/types';

const PATH = 'contact';

/**
 * Retrieves a specific contact.
 * @param req - The request payload containing the contact ID and optional activity inclusion flag.
 * @returns A promise resolving to the requested `Contact` resource.
 */
export async function getContact(req: GetContactRequest): Promise<Contact> {
  const { contactId, includeActivities = false } = req;

  const { data } = await appAxios().get<Contact>(`${PATH}/${contactId}`, {
    params: { includeActivities }
  });

  return data;
}

/**
 * Retrieves the current user's contact details.
 * @returns A promise resolving to the current user's `Contact` resource.
 */
export async function getCurrentUserContact(): Promise<Contact> {
  const { data } = await appAxios().get<Contact>(`${PATH}`);

  return data;
}

/**
 * Deletes a specific contact.
 * @param req - The request payload containing the contact ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteContact(req: DeleteContactRequest): Promise<void> {
  const { contactId } = req;

  await appAxios().delete(`${PATH}/${contactId}`);
}

/**
 * Returns contacts matching the supplied criteria.
 * @param req - The request payload containing matching criteria.
 * @returns A promise resolving to an array of matching `Contact` resources.
 */
export async function matchContacts(req: ListContactsRequest): Promise<Contact[]> {
  const { data } = await appAxios().post<Contact[]>(`${PATH}/match`, req);

  return data;
}

/**
 * Searches contacts using the supplied filters.
 * @param req - The request payload containing search criteria.
 * @returns A promise resolving to an array of `Contact` resources.
 */
export async function searchContacts(req: ListContactsRequest): Promise<Contact[]> {
  const { data } = await appAxios().post<Contact[]>(`${PATH}/search`, req);

  return data;
}

/**
 * Updates the current contact.
 * @param req - The request payload containing updated contact data.
 * @returns A promise resolving to the updated `Contact` resource.
 */
export async function putContact(req: PutContactRequest): Promise<Contact> {
  const { data } = await appAxios().put<Contact>(`${PATH}`, req);

  return data;
}

/** Hybrid default export object for backward compatibility */
export const contactService = {
  getContact,
  getCurrentUserContact,
  deleteContact,
  matchContacts,
  searchContacts,
  putContact
};
