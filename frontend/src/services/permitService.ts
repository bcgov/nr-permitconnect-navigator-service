import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type { ListPermitsOptions, Permit } from '@/types';
import type { Initiative } from '@/utils/enums/application';

const PATH = 'permit';

export default {
  /**
   * @function createPermit
   * @returns {Promise} An axios response
   */
  createPermit(data: Permit) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function deletePermit
   * @returns {Promise} An axios response
   */
  deletePermit(permitId: string) {
    return appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${permitId}`);
  },

  /**
   * @function getPermit
   * @returns {Promise} An axios response
   */
  getPermit(permitId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${permitId}`);
  },

  /**
   * @function getPermitTypes
   * @param {Initiative} initiative Initiative type to get permit types for
   * @returns {Promise} An axios response
   */
  getPermitTypes(initiative: Initiative) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/types`, { params: { initiative } });
  },

  /**
   * @function listPermits
   * @returns {Promise} An axios response
   */
  async listPermits(options?: ListPermitsOptions) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, { params: options });
  },

  /**
   * @function updatePermit
   * @returns {Promise} An axios response
   */
  updatePermit(data: Permit) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${data.permitId}`, data);
  }
};
