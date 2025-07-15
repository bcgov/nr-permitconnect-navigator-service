import { appAxios } from './interceptors';
import { Initiative } from '@/utils/enums/application';
import { delimitEmails } from '@/utils/utils';

import type { IDraftableProjectService } from '@/interfaces/IProjectService';
import type { Email, ElectrificationProjectSearchParameters, Draft } from '@/types';

const PATH = 'project';

const service: IDraftableProjectService = {
  /**
   * @function createProject
   * @returns {Promise} An axios response
   */
  createProject(data?: any) {
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function emailConfirmation
   * Send an email with the electrification project/enquiry/permit confirmation data
   * @returns {Promise} An axios response
   */
  emailConfirmation(emailData: Email) {
    if (emailData.to && !Array.isArray(emailData.to)) {
      emailData.to = delimitEmails(emailData.to);
    }
    if (emailData.cc && !Array.isArray(emailData.cc)) {
      emailData.cc = delimitEmails(emailData.cc);
    }
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/email`, emailData);
  },

  /**
   * @function deleteDraft
   * @returns {Promise} An axios response
   */
  deleteDraft(draftId: string) {
    return appAxios().delete(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/${draftId}`);
  },

  /**
   * @function getActivityIds
   * @returns {Promise} An axios response
   */
  getActivityIds() {
    return appAxios().get(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/activityIds`);
  },

  /**
   * @function getDraft
   * @returns {Promise} An axios response
   */
  getDraft(draftId: string) {
    return appAxios().get(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/${draftId}`);
  },

  /**
   * @function getDrafts
   * @returns {Promise} An axios response
   */
  getDrafts() {
    return appAxios().get(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft`);
  },

  /**
   * @function getProjects
   * @returns {Promise} An axios response
   */
  getProjects() {
    return appAxios().get(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`);
  },

  /**
   * @function getStatistics
   * @returns {Promise} An axios response
   */
  getStatistics(filters?: any) {
    return appAxios().get(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/statistics`, {
      params: { ...filters }
    });
  },

  /**
   * @function getProject
   * @returns {Promise} An axios response
   */
  getProject(projectId: string) {
    return appAxios().get(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${projectId}`);
  },

  /**
   * @function searchProjects
   * @returns {Promise} An axios response
   */
  searchProjects(filters?: ElectrificationProjectSearchParameters) {
    return appAxios().get(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/search`, { params: { ...filters } });
  },

  /**
   * @function submitDraft
   * @returns {Promise} An axios response
   */
  submitDraft(data?: any) {
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/submit`, data);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(data?: Partial<Draft>) {
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft`, data);
  },

  /**
   * @function updateIsDeletedFlag
   * @returns {Promise} An axios response
   */
  updateIsDeletedFlag(projectId: string, isDeleted: boolean) {
    return appAxios().patch(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${projectId}/delete`, {
      isDeleted: isDeleted
    });
  },

  /**
   * @function updateProject
   * @returns {Promise} An axios response
   */
  updateProject(projectId: string, data: any) {
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${projectId}`, data);
  }
};

export default service;
