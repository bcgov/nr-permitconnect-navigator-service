import axios from 'axios';
import config from 'config';

import { Action } from '../utils/enums/application';
import { Problem, uuidValidateV4 } from '../utils';

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

/**
 * @function createBucket
 * Creates a bucket record. Bucket should exist in S3. If the set of bucket, endpoint and key match
 * an existing record, the user will be added to that existing bucket with the provided permissions
 * instead of generating a new bucket record.
 * This endpoint can be used to grant the current user permission to upload to a new or existing bucket.
 * @param {string} bearerToken The bearer token of the authorized user
 * @param {Action[]} permissions An array of permissions to grant the user
 */
export const createBucket = async (bearerToken: string, permissions: Array<Action>) => {
  const { data } = await comsAxios({
    headers: { Authorization: `Bearer ${bearerToken}` }
  }).put('/bucket', {
    accessKeyId: config.get('server.objectStorage.accessKeyId'),
    bucket: config.get('server.objectStorage.bucket'),
    bucketName: 'PCNS',
    endpoint: config.get('server.objectStorage.endpoint'),
    secretAccessKey: config.get('server.objectStorage.secretAccessKey'),
    key: config.get('server.objectStorage.key'),
    permCodes: permissions
  });
  return data;
};

  /**
   * Get an object
   * @param bearerToken The bearer token of the authorized user
   * @param objectId The id for the object to get
   */
  async getObject(bearerToken: string, objectId: string) {
    if (!uuidValidateV4(objectId)) {
      throw new Problem(422, { detail: 'Invalid objectId parameter' });
    }
    const { status, headers, data } = await comsAxios({
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${bearerToken}` }
    }).get(`/object/${objectId}`);
    return { status, headers, data };
  }
};
