import { appAxios } from './interceptors';

const PATH = 'reporting';

export default {
  /**
   * @function getElectrificationProjectPermitData
   * @returns {Promise} An axios response
   */
  getElectrificationProjectPermitData() {
    return appAxios().get(`${PATH}/electrificationProject/permit`);
  },

  /**
   * @function getGeneralProjectPermitData
   * @returns {Promise} An axios response
   */
  getGeneralProjectPermitData() {
    return appAxios().get(`${PATH}/generalProject/permit`);
  },

  /**
   * @function getProjectPermitData
   * @returns {Promise} An axios response
   */
  getHousingProjectPermitData() {
    return appAxios().get(`${PATH}/housingProject/permit`);
  }
};
