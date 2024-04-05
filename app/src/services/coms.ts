import axios from 'axios';
import config from 'config';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { IncomingHttpHeaders } from 'http';

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
   * @param {IncomingHttpHeaders} incomingHeaders The request headers
   * @param {string} objectId The id for the object to get
   */
  async getObject(incomingHeaders: IncomingHttpHeaders, objectId: string) {
    const { status, headers, data } = await comsAxios({
      responseType: 'arraybuffer',
      headers: { Authorization: incomingHeaders.authorization }
    }).get(`/object/${objectId}`);
    return { status, headers, data };
  },

  /**
   * @function getObjects
   * Gets a list of objects
   * @param {IncomingHttpHeaders} incomingHeaders The request headers
   * @param {string[]} objectIds Array of object ids to get
   */
  async getObjects(incomingHeaders: IncomingHttpHeaders, objectIds: Array<string>) {
    const { data } = await comsAxios({ headers: { Authorization: incomingHeaders.authorization } }).get('/object', {
      params: { objectId: objectIds }
    });

    return data;
  }
};

export default service;
