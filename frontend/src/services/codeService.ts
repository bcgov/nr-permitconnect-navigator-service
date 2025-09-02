import { appAxios } from './interceptors';

const path = 'code';

export default {
  /**
   * Retrieves all code tables
   * @returns {Promise} An axios response
   */

  getCodeTables() {
    return appAxios().get(path);
  }
};
