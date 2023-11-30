import { appAxios } from './interceptors';

export default {
  /**
   * @function getSubmissions
   * @returns {Promise} An axios response
   */
  getSubmissions() {
    return appAxios().get('chefs/submissions');
  },

  /**
   * @function getSubmission
   * @returns {Promise} An axios response
   */
  getSubmission(formId: string, formSubmissionId: string) {
    return appAxios().get(`chefs/submission/${formSubmissionId}`, { params: { formId } });
  }
};
