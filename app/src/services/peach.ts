import axios from 'axios';
import config from 'config';

import { Problem } from '../utils/index.ts';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Record as PeachRecord } from '../types/pies.d.ts';

/**
 * Gets Auth token using PEACH client credentials
 * @returns A valid access token
 */
async function getToken() {
  const response = await axios({
    method: 'POST',
    url: config.get('server.peach.tokenUrl'),
    data: {
      grant_type: 'client_credentials',
      client_id: config.get('server.peach.clientId'),
      client_secret: config.get('server.peach.clientSecret')
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  });
  return response.data.access_token;
}

/**
 * Returns an Axios instance for the PEACH API
 * @param options Axios request config options
 * @returns An axios instance
 */
function peachAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  // Create axios instance
  const instance = axios.create({
    baseURL: config.get('server.peach.apiPath'),
    timeout: 10000,
    ...options
  });

  // Add bearer token
  instance.interceptors.request.use(async (config) => {
    const token = await getToken();
    const auth = token ? `Bearer ${token}` : '';
    config.headers['Authorization'] = auth;
    return config;
  });
  return instance;
}

/**
 * Get a specific PEACH Record
 * @param recordId Id of the record
 * @param systemId System for the record
 * @returns A Promise that resolves to a PEACH Record
 */
export const getPeachRecord = async (recordId: string, systemId?: string): Promise<PeachRecord> => {
  try {
    const { data } = await peachAxios().get('/records', { params: { record_id: recordId, system_id: systemId } });
    return data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const detail = e.response?.data.detail;
      const status = e.response ? e.response.status : 500;
      throw new Problem(status, { detail }, { extra: { peachError: e.response?.data } });
    } else {
      throw new Problem(500, { detail: 'Server Error' });
    }
  }
};
