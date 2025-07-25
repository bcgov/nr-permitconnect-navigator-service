import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type { ListPermitsOptions, Permit } from '@/types';
import type { Initiative } from '@/utils/enums/application';

const PATH = 'permit';

export default {
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
   * @function upsertPermit
   * @returns {Promise} An axios response
   */
  upsertPermit(data: Permit) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, data);
  }
};
