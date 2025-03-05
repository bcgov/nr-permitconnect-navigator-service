import { appAxios } from './interceptors';
import { delimitEmails } from '@/utils/utils';

import type { Email, Draft, SubmissionSearchParameters } from '@/types';

export default {
  /**
   * @function getActivityIds
   * @returns {Promise} An axios response
   */
  getActivityIds() {
    return appAxios().get('submission/activityIds');
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
   * @function deleteDraft
   * @returns {Promise} An axios response
   */
  deleteDraft(draftId: string) {
    return appAxios().delete(`submission/draft/${draftId}`);
  },

  /**
   * @function getSubmissions
   * @returns {Promise} An axios response
   */
  getSubmissions() {
    return appAxios().get('submission');
  },

  /**
   * @function getDraft
   * @returns {Promise} An axios response
   */
  getDraft(draftId: string) {
    return appAxios().get(`submission/draft/${draftId}`);
  },

  /**
   * @function getDrafts
   * @returns {Promise} An axios response
   */
  getDrafts() {
    return appAxios().get('submission/draft');
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
  searchSubmissions(filters?: SubmissionSearchParameters) {
    return appAxios().get('submission/search', { params: { ...filters } });
  },

  /**
   * @function submitDraft
   * @returns {Promise} An axios response
   */
  submitDraft(data?: any) {
    return appAxios().put('submission/draft/submit', data);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(data?: Partial<Draft>) {
    return appAxios().put('submission/draft', data);
  },

  /**
   * @function updateIsDeletedFlag
   * @returns {Promise} An axios response
   */
  updateIsDeletedFlag(submissionId: string, isDeleted: boolean) {
    return appAxios().patch(`submission/${submissionId}/delete`, { isDeleted: isDeleted });
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
    return appAxios().put('submission/email', emailData);
  }
};
