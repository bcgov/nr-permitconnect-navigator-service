import { appAxios } from './interceptors';

import type { ListPermitsOptions, Permit } from '@/types';

export default {
  /**
   * @function createPermit
   * @returns {Promise} An axios response
   */
  createPermit(data: Permit) {
    return appAxios().put('permit', data);
  },

  /**
   * @function deletePermit
   * @returns {Promise} An axios response
   */
  deletePermit(permitId: string) {
    return appAxios().delete(`permit/${permitId}`);
  },

  /**
   * @function getPermit
   * @returns {Promise} An axios response
   */
  getPermit(permitId: string) {
    return appAxios().get(`permit/${permitId}`);
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
  async listPermits(options?: ListPermitsOptions) {
    return appAxios().get('permit', { params: options });
  },

  /**
   * @function updatePermit
   * @returns {Promise} An axios response
   */
  updatePermit(data: Permit) {
    return appAxios().put(`permit/${data.permitId}`, data);
  }
};
