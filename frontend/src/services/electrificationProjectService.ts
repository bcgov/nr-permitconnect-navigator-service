import { appAxios } from './interceptors';
import { delimitEmails } from '@/utils/utils';

import type { IProjectService } from '@/interfaces/IProjectService';
import type { Email, ElectrificationProjectSearchParameters } from '@/types';

const service: IProjectService = {
  /**
   * @function createProject
   * @returns {Promise} An axios response
   */
  createProject(data?: any) {
    return appAxios().put('electrificationProject', data);
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
    return appAxios().put('electrificationProject/email', emailData);
  },

  /**
   * @function deleteProject
   * @returns {Promise} An axios response
   */
  deleteProject(electrificationProjectId: string) {
    return appAxios().delete(`electrificationProject/${electrificationProjectId}`);
  },

  /**
   * @function getActivityIds
   * @returns {Promise} An axios response
   */
  getActivityIds() {
    return appAxios().get('electrificationProject/activityIds');
  },

  /**
   * @function getProjects
   * @returns {Promise} An axios response
   */
  getProjects() {
    return appAxios().get('electrificationProject');
  },

  /**
   * @function getStatistics
   * @returns {Promise} An axios response
   */
  getStatistics(filters?: any) {
    return appAxios().get('electrificationProject/statistics', { params: { ...filters } });
  },

  /**
   * @function getProject
   * @returns {Promise} An axios response
   */
  getProject(electrificationProjectId: string) {
    return appAxios().get(`electrificationProject/${electrificationProjectId}`);
  },

  /**
   * @function searchProjects
   * @returns {Promise} An axios response
   */
  searchProjects(filters?: ElectrificationProjectSearchParameters) {
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
   * @function updateIsDeletedFlag
   * @returns {Promise} An axios response
   */
  updateIsDeletedFlag(electrificationProjectId: string, isDeleted: boolean) {
    return appAxios().patch(`electrificationProject/${electrificationProjectId}/delete`, { isDeleted: isDeleted });
  },

  /**
   * @function updateProject
   * @returns {Promise} An axios response
   */
  updateProject(electrificationProjectId: string, data: any) {
    return appAxios().put(`electrificationProject/${electrificationProjectId}`, data);
  }
};

export default service;
