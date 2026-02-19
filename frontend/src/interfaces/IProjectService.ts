import type { Draft, ElectrificationProjectSearchParameters, Email, HousingProjectSearchParameters } from '@/types';
import type { AxiosResponse } from 'axios';

export interface IProjectService {
  createProject(data?: unknown): Promise<AxiosResponse>;
  deleteProject(projectId: string): Promise<AxiosResponse>;
  emailConfirmation(emailData: Email): Promise<AxiosResponse>;
  getActivityIds(): Promise<AxiosResponse>;
  getProjects(): Promise<AxiosResponse>;
  getStatistics(filters?: unknown): Promise<AxiosResponse>;
  getProject(projectId: string): Promise<AxiosResponse>;
  searchProjects(
    filters?: ElectrificationProjectSearchParameters | HousingProjectSearchParameters
  ): Promise<AxiosResponse>;
  submitDraft(data?: unknown): Promise<AxiosResponse>;
  updateProject(projectId: string, data: unknown): Promise<AxiosResponse>;
}

export interface IDraftableProjectService extends IProjectService {
  deleteDraft(draftId: string): Promise<AxiosResponse>;
  getDraft(draftId: string): Promise<AxiosResponse<Draft<unknown>>>;
  getDrafts(): Promise<AxiosResponse>;
  upsertDraft(data?: Partial<Draft<unknown>>): Promise<AxiosResponse>;
}
