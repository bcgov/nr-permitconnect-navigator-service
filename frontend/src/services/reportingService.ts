import { appAxios } from './interceptors';

export default {
  /**
   * @function getHousingProjectPermitData
   * @returns {Promise} An axios response
   */
  getHousingProjectPermitData() {
    return appAxios().get('reporting/housingProject/permit');
  }
};
