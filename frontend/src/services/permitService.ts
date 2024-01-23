import { appAxios } from './interceptors';

import type { Permit } from '@/types';

export default {
  /**
   * @function createPermit
   * @returns {Promise} An axios response
   */
  createPermit(data: Permit) {
    return appAxios().put('permit', data);
  },

  /**
   * @function getPermitTypes
   * @returns {Promise} An axios response
   */
  getPermitTypes() {
    return appAxios().get('permit/types');
  },

  /**
   * @function listPermits
   * @returns {Promise} An axios response
   */
  async listPermits(submissionId: string) {
    return appAxios().get(`permit/list/${submissionId}`);
  },

  /**
   * @function updatePermit
   * @returns {Promise} An axios response
   */
  updatePermit(data: Permit) {
    return appAxios().put(`permit/${data.permitId}`, data);
  }
};
