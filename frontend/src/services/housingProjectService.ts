import { appAxios } from './interceptors';
import { delimitEmails } from '@/utils/utils';

import type { Email, Draft, HousingProjectSearchParameters } from '@/types';

export default {
  /**
   * @function getActivityIds
   * @returns {Promise} An axios response
   */
  getActivityIds() {
    return appAxios().get('housingProject/activityIds');
  },

  /**
   * @function createHousingProject
   * @returns {Promise} An axios response
   */
  createHousingProject(data?: any) {
    return appAxios().put('housingProject', data);
  },

  /**
   * @function deleteHousingProject
   * @returns {Promise} An axios response
   */
  deleteHousingProject(housingProjectId: string) {
    return appAxios().delete(`housingProject/${housingProjectId}`);
  },

  /**
   * @function deleteDraft
   * @returns {Promise} An axios response
   */
  deleteDraft(draftId: string) {
    return appAxios().delete(`housingProject/draft/${draftId}`);
  },

  /**
   * @function getHousingProjects
   * @returns {Promise} An axios response
   */
  getHousingProjects() {
    return appAxios().get('housingProject');
  },

  /**
   * @function getDraft
   * @returns {Promise} An axios response
   */
  getDraft(draftId: string) {
    return appAxios().get(`housingProject/draft/${draftId}`);
  },

  /**
   * @function getDrafts
   * @returns {Promise} An axios response
   */
  getDrafts() {
    return appAxios().get('housingProject/draft');
  },

  /**
   * @function getStatistics
   * @returns {Promise} An axios response
   */
  getStatistics(filters?: any) {
    return appAxios().get('housingProject/statistics', { params: { ...filters } });
  },

  /**
   * @function getHousingProject
   * @returns {Promise} An axios response
   */
  getHousingProject(housingProjectId: string) {
    return appAxios().get(`housingProject/${housingProjectId}`);
  },

  /**
   * @function searchHousingProjects
   * @returns {Promise} An axios response
   */
  searchHousingProjects(filters?: HousingProjectSearchParameters) {
    return appAxios().get('housingProject/search', { params: { ...filters } });
  },

  /**
   * @function submitDraft
   * @returns {Promise} An axios response
   */
  submitDraft(data?: any) {
    return appAxios().put('housingProject/draft/submit', data);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(data?: Partial<Draft>) {
    return appAxios().put('housingProject/draft', data);
  },

  /**
   * @function updateIsDeletedFlag
   * @returns {Promise} An axios response
   */
  updateIsDeletedFlag(housingProjectId: string, isDeleted: boolean) {
    return appAxios().patch(`housingProject/${housingProjectId}/delete`, { isDeleted: isDeleted });
  },

  /**
   * @function updateHousingProject
   * @returns {Promise} An axios response
   */
  updateHousingProject(housingProjectId: string, data: any) {
    return appAxios().put(`housingProject/${housingProjectId}`, data);
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
    return appAxios().put('housingProject/email', emailData);
  }
};
