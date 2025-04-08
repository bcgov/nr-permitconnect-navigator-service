import { appAxios } from './interceptors';

export default {
  /**
   * @function getElectrificationProjectPermitData
   * @returns {Promise} An axios response
   */
  getElectrificationProjectPermitData() {
    return appAxios().get('reporting/electrificationProject/permit');
  },

  /**
   * @function getProjectPermitData
   * @returns {Promise} An axios response
   */
  getHousingProjectPermitData() {
    return appAxios().get('reporting/housingProject/permit');
  }
};
