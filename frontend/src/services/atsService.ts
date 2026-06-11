import type { AxiosResponse } from 'axios';
import { appAxios } from './interceptors';

import type { AtsClientResource, AtsClientsResource, AtsEnquiryResource, SearchAtsUsersRequest } from '@/types';

const PATH = 'ats';

// TODO: As part of the ATS refactor, these services should return the resource directly

/**
 * Creates a client resource in ATS.
 * @param req - The ATS client creation payload.
 * @returns A promise resolving to the created ATS client.
 */
export async function createAtsClient(req: AtsClientResource): Promise<AxiosResponse<AtsClientResource>> {
  const response = await appAxios().post<AtsClientResource>(`${PATH}/client`, req);

  return response;
}

/**
 * Creates an enquiry resource in ATS.
 * @param req - The ATS enquiry creation payload.
 * @returns A promise resolving to the created ATS enquiry.
 */
export async function createAtsEnquiry(req: AtsEnquiryResource): Promise<AxiosResponse<AtsEnquiryResource>> {
  const response = await appAxios().post<AtsEnquiryResource>(`${PATH}/enquiry`, req);

  return response;
}

/**
 * Searches for ATS users.
 * @param req - The search request payload.
 * @returns A promise resolving to ATS user search results.
 */
export async function searchAtsUsers(req: SearchAtsUsersRequest): Promise<AxiosResponse<AtsClientsResource>> {
  const { ...params } = req;

  const response = await appAxios().get<AtsClientsResource>(`${PATH}/clients`, {
    params
  });

  return response;
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
