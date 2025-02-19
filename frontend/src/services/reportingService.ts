import { appAxios } from './interceptors';

export default {
  /**
   * @function getSubmissionPermitData
   * @returns {Promise} An axios response
   */
  getSubmissionPermitData() {
    return appAxios().get('reporting/submission/permit');
  }
};
