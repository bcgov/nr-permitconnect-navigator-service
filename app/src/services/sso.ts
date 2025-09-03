import axios from 'axios';
import config from 'config';

import type { AxiosInstance } from 'axios';
import type { BceidSearchParameters, IdirSearchParameters } from '../types';

/**
 * Gets Auth token using SSO credentials
 * @returns A valid access token
 */
async function getToken() {
  const response = await axios({
    method: 'POST',
    url: config.get('server.sso.tokenUrl'),
    data: {
      grant_type: 'client_credentials',
      client_id: config.get('server.sso.clientId'),
      client_secret: config.get('server.sso.clientSecret')
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
function ssoAxios(): AxiosInstance {
  // Create axios instance
  const ssoAxios = axios.create({
    baseURL: config.get('server.sso.apiPath'),
    timeout: 10000
  });
  // Add bearer token
  ssoAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    const auth = token ? `Bearer ${token}` : '';
    config.headers['Authorization'] = auth;
    return config;
  });
  return ssoAxios;
}

/**
 * Retrieve all IDIR users matching the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the response from the external api
 */
export const searchIdirUsers = async (params?: IdirSearchParameters) => {
  try {
    const env = config.get('server.env');
    const { data, status } = await ssoAxios().get(`/${env}/idir/users`, { params: params });
    return { data: data.data, status };
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
 * Retrieve all basic BCeID matching the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the response from the external api
 */
export const searchBasicBceidUsers = async (params?: BceidSearchParameters) => {
  try {
    const env = config.get('server.env');
    const { data, status } = await ssoAxios().get(`/${env}/basic-bceid/users`, { params: params });
    return { data: data.data, status };
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
 * Retrieve all business BCeID matching the search parameters
 * @param params - The search parameters
 * @returns A Promise that resolves to the response from the external api
 */
export const searchBusinessBceidUsers = async (params?: BceidSearchParameters) => {
  try {
    const env = config.get('server.env');
    const { data, status } = await ssoAxios().get(`/${env}/business-bceid/users`, { params: params });
    return { data: data.data, status };
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
