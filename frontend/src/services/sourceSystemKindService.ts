import { appAxios } from './interceptors';

const path = 'sourceSystemKind';

export default {
  /**
   * @function getSourceSystemKinds
   * Retrieves all source system kinds
   * @returns {Promise<data | null>} The result of calling code api
   */
  getSourceSystemKinds() {
    return appAxios().get(path);
  }
};
