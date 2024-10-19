import { appAxios } from './interceptors';

export default {
  /**
   * @function searchATSUsers
   * Searches for ATS users
   * @param {params} data The search parameters
   * @returns {Promise<data | null>} The result of calling the search api
   */

  searchATSUsers(params?: any) {
    return appAxios().get('ats/clients', { params: params });
  },

  /**
   * @function createATSClient
   * @returns {Promise} An axios response
   */
  createATSClient(data?: any) {
    return appAxios().post('ats/client', data);
  }
};
