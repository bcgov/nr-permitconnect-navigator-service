import axios from 'axios';
import config from 'config';
import { IncomingHttpHeaders } from 'http';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * @function comsAxios
 * Returns an Axios instance for the COMS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function comsAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  // Create axios instance
  const instance = axios.create({
    baseURL: config.get('frontend.coms.apiPath'),
    timeout: 10000,
    ...options
  });

  return instance;
}

const service = {
  /**
   * @function getObject
   * Get an object
   * @param {string} objectId The id for the object to get
   */
  getObject(headers: IncomingHttpHeaders, objectId: string) {
    return comsAxios({ responseType: 'arraybuffer', headers }).get(`/object/${objectId}`);
  }
};

export default service;
