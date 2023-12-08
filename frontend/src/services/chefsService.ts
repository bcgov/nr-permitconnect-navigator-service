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
   * @function getSubmission
   * @returns {Promise} An axios response
   */
  getSubmission(formId: string, formSubmissionId: string) {
    return appAxios().get(`chefs/submission/${formSubmissionId}`, { params: { formId } });
  },

  /**
   * @function getSubmissionStatus
   * @returns {Promise} An axios response
   */
  getSubmissionStatus(formId: string, formSubmissionId: string) {
    return appAxios().get(`chefs/submission/${formSubmissionId}/status`, { params: { formId } });
  },

  /**
   * @function updateSubmission
   * @returns {Promise} An axios response
   */
  updateSubmission(formId: string, formSubmissionId: string, data: any) {
    return appAxios().put(`chefs/submission/${formSubmissionId}`, data, { params: { formId } });
  }
};
