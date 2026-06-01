import { appAxios } from './interceptors';

import type {
  ActivityContact,
  CreateActivityContactRequest,
  DeleteActivityContactRequest,
  ListActivityContactsRequest,
  PutActivityContactRequest
} from '@/types';

/**
 * Creates a contact association for an activity.
 * @param req - The request payload containing path parameters and the contact role.
 * @returns A promise resolving to the created `ActivityContact` resource.
 */
export async function createActivityContact(req: CreateActivityContactRequest): Promise<ActivityContact> {
  const { activityId, contactId, ...body } = req;
  const { data } = await appAxios().post<ActivityContact>(`activity/${activityId}/contact/${contactId}`, body);
  return data;
}

/**
 * Deletes a contact association from an activity.
 * @param req - The request payload containing the compound key for deletion.
 * @returns A promise resolving to the deleted `ActivityContact` resource.
 */
export async function deleteActivityContact(req: DeleteActivityContactRequest): Promise<ActivityContact> {
  const { activityId, contactId } = req;
  const { data } = await appAxios().delete<ActivityContact>(`activity/${activityId}/contact/${contactId}`);
  return data;
}

/**
 * Retrieves all contacts associated with a specific activity.
 * @param activityId - The ID of the activity to list contacts for.
 * @returns A promise resolving to an array of `ActivityContact` resources.
 */
export async function listActivityContacts(req: ListActivityContactsRequest): Promise<ActivityContact[]> {
  const { activityId } = req;
  const { data } = await appAxios().get(`activity/${activityId}/contact`);
  return data;
}

/**
 * Updates a contact association for an activity.
 * @param req - The request payload containing path parameters and updatable fields.
 * @returns A promise resolving to the updated `ActivityContact` and any optionally demoted contact.
 */
export async function putActivityContact(
  req: PutActivityContactRequest
): Promise<{ updated: ActivityContact; demoted: ActivityContact | undefined }> {
  const { activityId, contactId, ...body } = req;
  const { data } = await appAxios().put(`activity/${activityId}/contact/${contactId}`, body);
  return data;
}

/** Hybrid default export object for backward compatibility */
const activityService = {
  createActivityContact,
  putActivityContact,
  deleteActivityContact,
  listActivityContacts
};

export default activityService;
