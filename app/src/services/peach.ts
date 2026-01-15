import axios from 'axios';
import config from 'config';

import { Problem } from '../utils/index.ts';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Record as PeachRecord } from '../types/pies.d.ts';

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
