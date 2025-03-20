import { appAxios } from './interceptors';
import { delimitEmails } from '@/utils/utils';

import type { Email, Draft, ElectrificationProjectSearchParameters } from '@/types';

export default {
  /**
   * @function getActivityIds
   * @returns {Promise} An axios response
   */
  getActivityIds() {
    return appAxios().get('electrificationProject/activityIds');
  },

  /**
   * @function createElectrificationProject
   * @returns {Promise} An axios response
   */
  createElectrificationProject(data?: any) {
    return appAxios().put('electrificationProject', data);
  },

  /**
   * @function deleteElectrificationProject
   * @returns {Promise} An axios response
   */
  deleteElectrificationProject(electrificationProjectId: string) {
    return appAxios().delete(`electrificationProject/${electrificationProjectId}`);
  },

  /**
   * @function deleteDraft
   * @returns {Promise} An axios response
   */
  deleteDraft(draftId: string) {
    return appAxios().delete(`electrificationProject/draft/${draftId}`);
  },

  /**
   * @function getElectrificationProjects
   * @returns {Promise} An axios response
   */
  getElectrificationProjects() {
    return appAxios().get('electrificationProject');
  },

  /**
   * @function getDraft
   * @returns {Promise} An axios response
   */
  getDraft(draftId: string) {
    return appAxios().get(`electrificationProject/draft/${draftId}`);
  },

  /**
   * @function getDrafts
   * @returns {Promise} An axios response
   */
  getDrafts() {
    return appAxios().get('electrificationProject/draft');
  },

  /**
   * @function getStatistics
   * @returns {Promise} An axios response
   */
  getStatistics(filters?: any) {
    return appAxios().get('electrificationProject/statistics', { params: { ...filters } });
  },

  /**
   * @function getElectrificationProject
   * @returns {Promise} An axios response
   */
  getElectrificationProject(electrificationProjectId: string) {
    return appAxios().get(`electrificationProject/${electrificationProjectId}`);
  },

  /**
   * @function searchElectrificationProjects
   * @returns {Promise} An axios response
   */
  searchElectrificationProjects(filters?: ElectrificationProjectSearchParameters) {
    return appAxios().get('electrificationProject/search', { params: { ...filters } });
  },

  /**
   * @function submitDraft
   * @returns {Promise} An axios response
   */
  submitDraft(data?: any) {
    return appAxios().put('electrificationProject/draft/submit', data);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(data?: Partial<Draft>) {
    return appAxios().put('electrificationProject/draft', data);
  },

  /**
   * @function updateIsDeletedFlag
   * @returns {Promise} An axios response
   */
  updateIsDeletedFlag(electrificationProjectId: string, isDeleted: boolean) {
    return appAxios().patch(`electrificationProject/${electrificationProjectId}/delete`, { isDeleted: isDeleted });
  },

  /**
   * @function updateElectrificationProject
   * @returns {Promise} An axios response
   */
  updateElectrificationProject(electrificationProjectId: string, data: any) {
    return appAxios().put(`electrificationProject/${electrificationProjectId}`, data);
  },

  /**
   * @function send
   * Send an email with the housing project confirmation data
   * @returns {Promise} An axios response
   */
  emailConfirmation(emailData: Email) {
    if (emailData.to && !Array.isArray(emailData.to)) {
      emailData.to = delimitEmails(emailData.to);
    }
    if (emailData.cc && !Array.isArray(emailData.cc)) {
      emailData.cc = delimitEmails(emailData.cc);
    }
    return appAxios().put('electrificationProject/email', emailData);
  }
};
