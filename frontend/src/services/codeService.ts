import { appAxios } from './interceptors';

const path = 'code';

export default {
  /**
   * @function getCodeTables
   * Retrieves all code tables
   * @returns {Promise<data | null>} The result of calling code api
   */

  getCodeTables() {
    return appAxios().get(path);
  }
};
