import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type {
  CreateEnquiryRequest,
  DeleteEnquiryRequest,
  Enquiry,
  GetEnquiryRequest,
  ListRelatedEnquiriesRequest,
  PatchEnquiryRequest,
  SearchEnquiriesRequest
} from '@/types';

const PATH = 'enquiry';

/**
 * Creates a new enquiry.
 * @param req - The request payload containing the enquiry data to create.
 * @returns A promise resolving to the created `Enquiry` resource.
 */
export async function createEnquiry(req: CreateEnquiryRequest): Promise<Enquiry> {
  const { ...body } = req;

  const { data } = await appAxios().post<Enquiry>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, body);

  return data;
}

/**
 * Deletes an enquiry.
 * @param req - The request payload containing the enquiry ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteEnquiry(req: DeleteEnquiryRequest): Promise<void> {
  const { enquiryId } = req;

  await appAxios().delete<Enquiry>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${enquiryId}`);
}

/**
 * Retrieves a single enquiry.
 * @param req - The request payload containing the enquiry ID.
 * @returns A promise resolving to the requested `Enquiry` resource.
 */
export async function getEnquiry(req: GetEnquiryRequest): Promise<Enquiry> {
  const { enquiryId } = req;

  const { data } = await appAxios().get<Enquiry>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${enquiryId}`);

  return data;
}

/**
 * Retrieves all enquiries.
 * @returns A promise resolving to an array of `Enquiry` resources.
 */
export async function listEnquiries(): Promise<Enquiry[]> {
  const { data } = await appAxios().get<Enquiry[]>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`);

  return data;
}

/**
 * Retrieves all enquiries associated with an activity.
 * @param req - The request payload containing the activity ID.
 * @returns A promise resolving to an array of `Enquiry` resources.
 */
export async function listRelatedEnquiries(req: ListRelatedEnquiriesRequest): Promise<Enquiry[]> {
  const { activityId } = req;

  const { data } = await appAxios().get<Enquiry[]>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/list/${activityId}`
  );

  return data;
}

/**
 * Searches enquiries using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `Enquiry` resources.
 */
export async function searchEnquiries(req: SearchEnquiriesRequest): Promise<Enquiry[]> {
  const { data } = await appAxios().post<Enquiry[]>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/search`, req);

  return data;
}

/**
 * Updates an existing enquiry.
 * @param req - The request payload containing the enquiry ID and updated fields.
 * @returns A promise resolving to the updated `Enquiry` resource.
 */
export async function patchEnquiry(req: PatchEnquiryRequest): Promise<Enquiry> {
  const { enquiryId, ...body } = req;

  const { data } = await appAxios().patch<Enquiry>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/${enquiryId}`,
    body
  );

  return data;
}

/** Hybrid default export object for backward compatibility */
export const enquiryService = {
  createEnquiry,
  deleteEnquiry,
  getEnquiry,
  listEnquiries,
  listRelatedEnquiries,
  searchEnquiries,
  patchEnquiry
};
