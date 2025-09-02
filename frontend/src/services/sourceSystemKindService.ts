import { appAxios } from './interceptors';

const path = 'sourceSystemKind';

export default {
  /**
   * Retrieves all source system kinds
   * @returns {Promise} An axios response
   */
  getSourceSystemKinds() {
    return appAxios().get(path);
  }
};
