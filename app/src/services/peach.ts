import axios from 'axios';
import config from 'config';

import { Problem } from '../utils';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { PeachRecord } from '../types/peachPies';

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
    // TODO-PR change to new PEACH endpoint once finished
    const { data } = await peachAxios().get('/process-events', { params: { recordId, systemId } });
    // const { data, status } = await peachAxios().get('/records', { params: { recordId, systemId } });
    // console.log('data', data);
    // console.log('status', status);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data.message;
      const status = e.response ? e.response.status : 500;
      throw new Problem(status, { detail: message });
    } else {
      throw new Problem(500, { detail: 'Server Error' });
    }
  }
};
