import axios from 'axios';
import config from 'config';

import { getCurrentUsername } from '../utils/utils.ts';

import type { AxiosInstance } from 'axios';
import type { AtsClientResource, AtsEnquiryResource, AtsUserSearchParameters, CurrentContext } from '../types/index.ts';

/**
 * Gets Auth token using ATS client credentials
 * @returns A valid access token
 */
async function getToken(): Promise<string> {
  const response = await axios({
    method: 'GET',
    url: config.get('server.ats.tokenUrl'),
    auth: {
      username: config.get('server.ats.clientId'),
      password: config.get('server.ats.clientSecret')
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  });

  return response.data.access_token;
}

/**
 * Returns an Axios instance with Authorization header
 * @returns An axios instance
 */
function atsAxios(): AxiosInstance {
  // Create axios instance
  const atsAxios = axios.create({
    baseURL: config.get('server.ats.apiPath'),
    timeout: 10000
  });
  // Add bearer token
  atsAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    const auth = token ? `Bearer ${token}` : '';
    config.headers.Authorization = auth;
    return config;
  });
  return atsAxios;
}

/**
 * Searches for ATS users
 * @param params - The optional search parameters
 * @returns A Promise that resolves to the response from the external api
 */
export const searchAtsUsers = async (params?: AtsUserSearchParameters) => {
  try {
    const { data, status } = await atsAxios().get('/clients', { params: params });
    return { data, status };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return {
        data: e.response?.data.message,
        status: e.response ? e.response.status : 500
      };
    } else {
      return {
        data: 'Error',
        status: 500
      };
    }
  }
};

/**
 * Creates a client in ATS
 * @param atsClient - The client data
 * @param currentContext - The current context of the request
 * @returns A Promise that resolves to the response from the external api
 */
export const createAtsClient = async (atsClient: AtsClientResource, currentContext: CurrentContext) => {
  try {
    const identityProvider = currentContext?.tokenPayload?.identity_provider.toUpperCase();
    // Set the createdBy field to current user with \\ as the separator for the domain and username to match Ats DB
    atsClient.createdBy = `${identityProvider}\\${getCurrentUsername(currentContext)}`;

    const { data, status } = await atsAxios().post('/clients', atsClient);
    return { data, status };
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      return {
        data: e.response?.data.message,
        status: e.response ? e.response.status : 500
      };
    } else {
      return {
        data: 'Error',
        status: 500
      };
    }
  }
};

/**
 * Creates a enquiry in ATS
 * @param atsEnquiry - The client data
   @param currentContext - The current context of the request
 * @returns A Promise that resolves to the response from the external api
 */
export const createAtsEnquiry = async (atsEnquiry: AtsEnquiryResource, currentContext: CurrentContext) => {
  try {
    const identityProvider = currentContext?.tokenPayload?.identity_provider.toUpperCase();
    // Set the createdBy field to current user with \\ as the separator for the domain and username to match Ats DB
    atsEnquiry.createdBy = `${identityProvider}\\${getCurrentUsername(currentContext)}`;

    const { data, status } = await atsAxios().post('/enquiries', atsEnquiry);
    return { data, status };
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      return {
        data: e.response?.data.message,
        status: e.response ? e.response.status : 500
      };
    } else {
      return {
        data: 'Error',
        status: 500
      };
    }
  }
};
