import type { Draft, ElectrificationProjectSearchParameters, Email, HousingProjectSearchParameters } from '@/types';
import type { AxiosResponse } from 'axios';

export interface IProjectService {
  createProject(data?: any): Promise<AxiosResponse<any, any>>;
  deleteProject(projectId: string): Promise<AxiosResponse<any, any>>;
  emailConfirmation(emailData: Email): Promise<AxiosResponse<any, any>>;
  getActivityIds(): Promise<AxiosResponse<any, any>>;
  getProjects(): Promise<AxiosResponse<any, any>>;
  getStatistics(filters?: any): Promise<AxiosResponse<any, any>>;
  getProject(projectId: string): Promise<AxiosResponse<any, any>>;
  searchProjects(
    filters?: ElectrificationProjectSearchParameters | HousingProjectSearchParameters
  ): Promise<AxiosResponse<any, any>>;
  submitDraft(data?: any): Promise<AxiosResponse<any, any>>;
  updateProject(projectId: string, data: any): Promise<AxiosResponse<any, any>>;
}

export interface IDraftableProjectService extends IProjectService {
  deleteDraft(draftId: string): Promise<AxiosResponse<any, any>>;
  getDraft(draftId: string): Promise<AxiosResponse<any, any>>;
  getDrafts(): Promise<AxiosResponse<any, any>>;
  updateDraft(data?: Partial<Draft>): Promise<AxiosResponse<any, any>>;
}
