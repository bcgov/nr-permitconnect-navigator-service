import { appAxios } from './interceptors';
import { Initiative } from '@/utils/enums/application';
import { delimitEmails } from '@/utils/utils';

import type { AxiosResponse } from 'axios';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';
import type {
  Email,
  ElectrificationProjectSearchParameters,
  Draft,
  ElectrificationProject,
  StatisticFilters
} from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectIntakeFormSchema';

const PATH = 'project';

export interface IElectrificationProjectService extends IDraftableProjectService {
  getProject(projectId: string): Promise<AxiosResponse<ElectrificationProject>>;
  deleteDraft(draftId: string): Promise<AxiosResponse>;
  getDraft(draftId: string): Promise<AxiosResponse<Draft<FormSchemaType>>>;
  getDrafts(): Promise<AxiosResponse<Draft<FormSchemaType>[]>>;
  upsertDraft(data?: Partial<Draft<FormSchemaType>>): Promise<AxiosResponse<Draft<FormSchemaType>>>;
}

const service: IElectrificationProjectService = {
  /**
   * @function createProject
   * @returns {Promise} An axios response
   */
  createProject(data?: Partial<ElectrificationProject>) {
    return appAxios().post(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function deleteProject
   * @returns {Promise} An axios response
   */
  deleteProject(projectId: string) {
    return appAxios().delete(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${projectId}`);
  },

  /**
   * @function deleteDraft
   * @returns {Promise} An axios response
   */
  deleteDraft(draftId: string) {
    return appAxios().delete(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/${draftId}`);
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
  getStatistics(filters?: StatisticFilters) {
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
    return appAxios().post(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/search`, filters);
  },

  /**
   * @function submitDraft
   * @returns {Promise} An axios response
   */
  submitDraft(data?: Partial<ElectrificationProject>) {
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/submit`, data);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  upsertDraft(data?: Partial<Draft<FormSchemaType>>) {
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft`, data);
  },

  /**
   * @function updateProject
   * @returns {Promise} An axios response
   */
  updateProject(projectId: string, data: ElectrificationProject) {
    return appAxios().put(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${projectId}`, data);
  }
};

export default service;
