import { appAxios } from './interceptors';
import { delimitEmails } from '@/utils/utils';

import type { Email } from '@/types';

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
   * @function deleteSubmission
   * @returns {Promise} An axios response
   */
  deleteSubmission(submissionId: string) {
    return appAxios().delete(`submission/${submissionId}`);
  },

  /**
   * @function getSubmissions
   * @returns {Promise} An axios response
   */
  getSubmissions(self?: boolean) {
    return appAxios().get('submission', { params: { self } });
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
  getSubmission(submissionId: string) {
    return appAxios().get(`submission/${submissionId}`);
  },

  /**
   * @function searchSubmissions
   * @returns {Promise} An axios response
   */
  searchSubmissions(filters?: any) {
    return appAxios().get('submission/search', { params: { ...filters } });
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
  },

  /**
   * @function send
   * Send an email with the submission confirmation data
   * @returns {Promise} An axios response
   */
  emailConfirmation(emailData: Email) {
    if (emailData.to && !Array.isArray(emailData.to)) {
      emailData.to = delimitEmails(emailData.to);
    }
    if (emailData.cc && !Array.isArray(emailData.cc)) {
      emailData.cc = delimitEmails(emailData.cc);
    }
    return appAxios().put('submission/emailConfirmation', { emailData });
  }
};
