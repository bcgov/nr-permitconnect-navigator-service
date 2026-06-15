import { api } from './apiClient';
import { createInitiativeRouteBuilder } from './routeBuilder';

import type {
  CreateEnquiryRequest,
  DeleteEnquiryRequest,
  Enquiry,
  GetEnquiryRequest,
  ListRelatedEnquiriesRequest,
  PatchEnquiryRequest,
  SearchEnquiriesRequest
} from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const enquiryRoute = createInitiativeRouteBuilder('enquiry');

const enquiryRoutes = {
  root: () => enquiryRoute(),
  byId: (id: string) => enquiryRoute(id),

  listRelated: (activityId: string) => enquiryRoute('list', activityId),
  search: () => enquiryRoute('search')
} as const;

/**
 * Creates a new enquiry.
 * @param req - The request payload containing the enquiry data to create.
 * @returns A promise resolving to the created `Enquiry` resource.
 */
export function createEnquiry(req: CreateEnquiryRequest): Promise<Enquiry> {
  const { ...body } = req;

  return api.post<Enquiry>(enquiryRoutes.root(), body);
}

/**
 * Deletes an enquiry.
 * @param req - The request payload containing the enquiry ID.
 * @returns A promise resolving when the operation completes.
 */
export function deleteEnquiry(req: DeleteEnquiryRequest): Promise<void> {
  const { enquiryId } = req;

  return api.delete(enquiryRoutes.byId(enquiryId));
}

/**
 * Retrieves a single enquiry.
 * @param req - The request payload containing the enquiry ID.
 * @returns A promise resolving to the requested `Enquiry` resource.
 */
export function getEnquiry(req: GetEnquiryRequest): Promise<Enquiry> {
  const { enquiryId } = req;

  return api.get<Enquiry>(enquiryRoutes.byId(enquiryId));
}

/**
 * Retrieves all enquiries.
 * @returns A promise resolving to an array of `Enquiry` resources.
 */
export function listEnquiries(): Promise<Enquiry[]> {
  return api.get<Enquiry[]>(enquiryRoutes.root());
}

/**
 * Retrieves all enquiries associated with an activity.
 * @param req - The request payload containing the activity ID.
 * @returns A promise resolving to an array of `Enquiry` resources.
 */
export function listRelatedEnquiries(req: ListRelatedEnquiriesRequest): Promise<Enquiry[]> {
  const { activityId } = req;

  return api.get<Enquiry[]>(enquiryRoutes.listRelated(activityId));
}

/**
 * Searches enquiries using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `Enquiry` resources.
 */
export function searchEnquiries(req: SearchEnquiriesRequest): Promise<Enquiry[]> {
  return api.post<Enquiry[]>(enquiryRoutes.search(), req);
}

/**
 * Updates an existing enquiry.
 * @param req - The request payload containing the enquiry ID and updated fields.
 * @returns A promise resolving to the updated `Enquiry` resource.
 */
export function patchEnquiry(req: PatchEnquiryRequest): Promise<Enquiry> {
  const { enquiryId, ...body } = req;

  return api.patch<Enquiry>(enquiryRoutes.byId(enquiryId), body);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const enquiryService = {
  createEnquiry,
  deleteEnquiry,
  getEnquiry,
  listEnquiries,
  listRelatedEnquiries,
  searchEnquiries,
  patchEnquiry
};
