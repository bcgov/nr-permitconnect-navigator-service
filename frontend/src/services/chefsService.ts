import { appAxios } from './interceptors';

export default {
  /**
   * @function getFormExport
   * @returns {Promise} An axios response
   */
  getFormExport() {
    return appAxios().get('chefs/export');
  },

  /**
   * @function getStatistics
   * @returns {Promise} An axios response
   */
  getStatistics(filters?: any) {
    return appAxios().get('chefs/submission/statistics', { params: { ...filters } });
  },

  /**
   * @function getSubmission
   * @returns {Promise} An axios response
   */
  getSubmission(formId: string, submissionId: string) {
    return appAxios().get(`chefs/submission/${submissionId}`, { params: { formId } });
  },

  /**
   * @function updateSubmission
   * @returns {Promise} An axios response
   */
  updateSubmission(submissionId: string, data: any) {
    return appAxios().put(`chefs/submission/${submissionId}`, data);
  }
};
