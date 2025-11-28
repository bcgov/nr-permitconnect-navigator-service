import { appAxios } from './interceptors';

import type { PermitTracking } from '@/types';

const PATH = 'peach';

export default {
  /**
   * @function getPeachSummary
   * @returns {Promise} An axios response
   */
  getPeachSummary(data: PermitTracking[]) {
    return appAxios().post(`${PATH}/record`, data);
  }
};
