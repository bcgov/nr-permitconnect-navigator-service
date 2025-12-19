import axios from 'axios';
import config from 'config';

import type { AxiosInstance } from 'axios';
import type { ATSClientResource, ATSEnquiryResource, ATSUserSearchParameters } from '../types/index.ts';

/**
 * Gets Auth token using ATS client credentials
 * @returns A valid access token
 */
async function getToken() {
  const response = await axios({
    method: 'GET',
    url: config.get('server.ats.tokenUrl'),
    auth: {
      username: config.get('server.ats.clientId') as string,
      password: config.get('server.ats.clientSecret') as string
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
 * @param options Axios request config options
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
    config.headers['Authorization'] = auth;
    return config;
  });
  return atsAxios;
}

/**
 * Searches for ATS users
 * @param params The search parameters
 * @returns A Promise that resolves to the response from the external api
 */
export const searchATSUsers = async (params?: ATSUserSearchParameters) => {
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
 * @param atsClient The client data
 * @returns A Promise that resolves to the response from the external api
 */
export const createATSClient = async (atsClient: ATSClientResource) => {
  try {
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
 * @param atsEnquiryThe client data
 * @returns A Promise that resolves to the response from the external api
 */
export const createATSEnquiry = async (atsEnquiry: ATSEnquiryResource) => {
  try {
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
