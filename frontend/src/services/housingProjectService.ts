import { appAxios } from './interceptors';
import { useAppStore } from '@/store';
import { delimitEmails } from '@/utils/utils';

import type { IDraftableProjectService } from '@/interfaces/IProjectService';
import type { Email, Draft, HousingProjectSearchParameters } from '@/types';

const PATH = 'project';

const service: IDraftableProjectService = {
  /**
   * @function createProject
   * @returns {Promise} An axios response
   */
  createProject(data?: any) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase().toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function deleteProject
   * @returns {Promise} An axios response
   */
  deleteProject(projectId: string) {
    return appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${projectId}`);
  },

  /**
   * @function deleteDraft
   * @returns {Promise} An axios response
   */
  deleteDraft(draftId: string) {
    return appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/draft/${draftId}`);
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
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/email`, emailData);
  },

  /**
   * @function getActivityIds
   * @returns {Promise} An axios response
   */
  getActivityIds() {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/activityIds`);
  },

  /**
   * @function getProjects
   * @returns {Promise} An axios response
   */
  getProjects() {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`);
  },

  /**
   * @function getDraft
   * @returns {Promise} An axios response
   */
  getDraft(draftId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/draft/${draftId}`);
  },

  /**
   * @function getDrafts
   * @returns {Promise} An axios response
   */
  getDrafts() {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/draft`);
  },

  /**
   * @function getStatistics
   * @returns {Promise} An axios response
   */
  getStatistics(filters?: any) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/statistics`, {
      params: { ...filters }
    });
  },

  /**
   * @function getProject
   * @returns {Promise} An axios response
   */
  getProject(projectId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${projectId}`);
  },

  /**
   * @function searchProjects
   * @returns {Promise} An axios response
   */
  searchProjects(filters?: HousingProjectSearchParameters) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/search`, { params: { ...filters } });
  },

  /**
   * @function submitDraft
   * @returns {Promise} An axios response
   */
  submitDraft(data?: any) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/draft/submit`, data);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(data?: Partial<Draft>) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/draft`, data);
  },

  /**
   * @function updateIsDeletedFlag
   * @returns {Promise} An axios response
   */
  updateIsDeletedFlag(projectId: string, isDeleted: boolean) {
    return appAxios().patch(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${projectId}/delete`, {
      isDeleted: isDeleted
    });
  },

  /**
   * @function updateProject
   * @returns {Promise} An axios response
   */
  updateProject(projectId: string, data: any) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${projectId}`, data);
  }
};

export default service;
