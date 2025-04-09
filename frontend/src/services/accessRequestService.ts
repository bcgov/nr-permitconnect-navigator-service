import { useAppStore } from '@/store';
import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';

const PATH = 'accessRequest';

/*
Supervisor
 - create access request
 - create revoke request
 - change role

Admin
 - create access request (auto approved)
 - create revoke request (auto approved)
 - approve access request
 - approve revoke request
 - deny access request
 - deny revoke request
 - change role
*/

export default {
  /**
   * @function createUserAccessRequest
   * @returns {Promise} An axios response
   */
  createUserAccessRequest(data: any) {
    return appAxios().post(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function processUserAccessRequest
   * @returns {Promise} An axios response
   */
  processUserAccessRequest(accessRequestId: string, data: any) {
    return appAxios().post(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${accessRequestId}`, data);
  },

  /**
   * @function getAccessRequests
   * @returns {Promise} An axios response
   */
  getAccessRequests(): Promise<AxiosResponse> {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`);
  }
};
