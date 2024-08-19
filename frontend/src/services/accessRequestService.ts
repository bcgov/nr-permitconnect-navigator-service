import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';

const PATH = 'accessRequest';

export default {
  /**
   * @function createUserAccessRequest
   * @returns {Promise} An axios response
   */
  createUserAccessRequest(data: any) {
    return appAxios().post(`${PATH}/`, data);
  },

  /**
   * @function deleteUserAccessRequest
   * @returns {Promise} An axios response
   */
  deleteAccessRequest(accessRequestId: string) {
    return appAxios().delete(`${PATH}/${accessRequestId}`);
  },

  /**
   * @function getAccessRequests
   * @returns {Promise} An axios response
   */
  getAccessRequests(): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}`);
  },

  /**
   * @function revokeUserAccessRequest
   * @returns {Promise} An axios response
   */
  revokeUserAccessRequest(data: any) {
    return appAxios().post(`${PATH}/`, data);
  }
};