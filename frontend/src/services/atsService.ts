import { apiRaw } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { AxiosResponse } from 'axios';
import type { AtsClientResource, AtsClientsResource, AtsEnquiryResource, SearchAtsUsersRequest } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const atsRoute = createRouteBuilder('ats');

const atsRoutes = {
  client: () => atsRoute('client'),
  clients: () => atsRoute('clients'),
  enquiry: () => atsRoute('enquiry')
} as const;

// TODO: As part of the ATS refactor, these services should return the resource directly

/**
 * Creates a client resource in ATS.
 * @param req - The ATS client creation payload.
 * @returns A promise resolving to the created ATS client.
 */
export function createAtsClient(req: AtsClientResource): Promise<AxiosResponse<AtsClientResource>> {
  return apiRaw.post<AtsClientResource>(atsRoutes.client(), req);
}

/**
 * Creates an enquiry resource in ATS.
 * @param req - The ATS enquiry creation payload.
 * @returns A promise resolving to the created ATS enquiry.
 */
export function createAtsEnquiry(req: AtsEnquiryResource): Promise<AxiosResponse<AtsEnquiryResource>> {
  return apiRaw.post<AtsEnquiryResource>(atsRoutes.enquiry(), req);
}

/**
 * Searches for ATS users.
 * @param req - The search request payload.
 * @returns A promise resolving to ATS user search results.
 */
export function searchAtsUsers(req: SearchAtsUsersRequest): Promise<AxiosResponse<AtsClientsResource>> {
  const { ...params } = req;

  return apiRaw.get<AtsClientsResource>(atsRoutes.clients(), {
    params
  });
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const atsService = {
  createAtsClient,
  createAtsEnquiry,
  searchAtsUsers
};
