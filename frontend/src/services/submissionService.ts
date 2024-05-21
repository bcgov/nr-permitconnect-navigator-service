import { appAxios } from './interceptors';

export default {
  /**
   * @function createDraft
   * @returns {Promise} An axios response
   */
  createDraft(data?: any) {
    return appAxios().put('submission/draft', data);
  },

  /**
   * @function createSubmission
   * @returns {Promise} An axios response
   */
  createSubmission(data?: any) {
    return appAxios().put('submission', data);
  },

  /**
   * @function getFormExport
   * @returns {Promise} An axios response
   */
  getSubmissions() {
    return appAxios().get('submission');
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
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(submissionId: string, data?: any) {
    return appAxios().put(`submission/draft/${submissionId}`, data);
  },

  /**
   * @function updateSubmission
   * @returns {Promise} An axios response
   */
  updateSubmission(submissionId: string, data: any) {
    return appAxios().put(`submission/${submissionId}`, data);
  }
};
