import { appAxios } from './interceptors';

export default {
  /**
   * @function getFormExport
   * @returns {Promise} An axios response
   */
  getSubmissions() {
    return appAxios().get('submission/');
  },

  /**
   * @function getStatistics
   * @returns {Promise} An axios response
   */
  getStatistics(filters?: any) {
    return appAxios().get('submission/statistics', { params: { ...filters } });
  },

  /**
   * @function getSubmission
   * @returns {Promise} An axios response
   */
  getSubmission(activityId: string) {
    return appAxios().get(`submission/${activityId}`);
  },

  /**
   * @function updateSubmission
   * @returns {Promise} An axios response
   */
  updateSubmission(submissionId: string, data: any) {
    return appAxios().put(`submission/${submissionId}`, data);
  }
};
