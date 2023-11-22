import { appAxios } from './interceptors';

export default {
  /**
   * @function exportSubmissions
   * @returns {Promise} An axios response
   */
  exportSubmissions(formId: string, versionId: string) {
    return appAxios().get(`chefs/forms/${formId}/export`, {
      responseType: 'blob',
      headers: { 'Content-Type': 'text/csv' },
      params: {
        format: 'csv',
        type: 'submissions',
        version: versionId
      }
    });
  },

  /**
   * @function getFormSubmissions
   * @returns {Promise} An axios response
   */
  getFormSubmissions(formId: string) {
    return appAxios().get(`chefs/forms/${formId}/submissions`);
  },

  /**
   * @function getPublishedVersion
   * @returns {Promise} An axios response
   */
  getPublishedVersion(formId: string) {
    return appAxios().get(`chefs/forms/${formId}/version`);
  },

  /**
   * @function getSubmission
   * @returns {Promise} An axios response
   */
  getSubmission(formSubmissionId: string) {
    return appAxios().get(`chefs/submission/${formSubmissionId}`);
  },

  /**
   * @function getVersion
   * @returns {Promise} An axios response
   */
  getVersion(formId: string, versionId: string) {
    return appAxios().get(`chefs/forms/${formId}/versions/${versionId}`);
  },

  /**
   * @function getVersionFields
   * @returns {Promise} An axios response
   */
  getVersionFields(formId: string, versionId: string) {
    return appAxios().get(`chefs/forms/${formId}/versions/${versionId}/fields`);
  },

  /**
   * @function getVersionSubmissions
   * @returns {Promise} An axios response
   */
  getVersionSubmissions(formId: string, versionId: string) {
    return appAxios().get(`chefs/forms/${formId}/versions/${versionId}/submissions`);
  }
};
