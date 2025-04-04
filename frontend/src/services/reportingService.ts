import { appAxios } from './interceptors';

export default {
  /**
   * @function getProjectPermitData
   * @returns {Promise} An axios response
   */
  getProjectPermitData() {
    return appAxios().get('reporting/housingProject/permit');
  }
};
