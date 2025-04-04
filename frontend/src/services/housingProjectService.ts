import { appAxios } from './interceptors';
import { delimitEmails } from '@/utils/utils';

import type { Email, Draft, HousingProjectSearchParameters } from '@/types';
import type { IProjectService } from '@/interfaces/IProjectService';

const service: IProjectService = {
  /**
   * @function getActivityIds
   * @returns {Promise} An axios response
   */
  getActivityIds() {
    return appAxios().get('housingProject/activityIds');
  },

  /**
   * @function createProject
   * @returns {Promise} An axios response
   */
  createProject(data?: any) {
    return appAxios().put('housingProject', data);
  },

  /**
   * @function deleteProject
   * @returns {Promise} An axios response
   */
  deleteProject(projectId: string) {
    return appAxios().delete(`housingProject/${projectId}`);
  },

  /**
   * @function deleteDraft
   * @returns {Promise} An axios response
   */
  deleteDraft(draftId: string) {
    return appAxios().delete(`housingProject/draft/${draftId}`);
  },

  /**
   * @function getProjects
   * @returns {Promise} An axios response
   */
  getProjects() {
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
   * @function getProject
   * @returns {Promise} An axios response
   */
  getProject(projectId: string) {
    return appAxios().get(`housingProject/${projectId}`);
  },

  /**
   * @function searchProjects
   * @returns {Promise} An axios response
   */
  searchProjects(filters?: HousingProjectSearchParameters) {
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
  updateIsDeletedFlag(projectId: string, isDeleted: boolean) {
    return appAxios().patch(`housingProject/${projectId}/delete`, { isDeleted: isDeleted });
  },

  /**
   * @function updateProject
   * @returns {Promise} An axios response
   */
  updateProject(projectId: string, data: any) {
    return appAxios().put(`housingProject/${projectId}`, data);
  },

  /**
   * @function emailConfirmation
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

export default service;
