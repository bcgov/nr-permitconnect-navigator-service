import type { AxiosResponse } from 'axios';
import type { ElectrificationProjectSearchParameters, HousingProjectSearchParameters } from './api/requests';
import type { Draft } from './api/resources';

export interface ProjectService {
  createProject(data?: unknown): Promise<AxiosResponse>;
  deleteProject(projectId: string): Promise<AxiosResponse>;
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

export interface DraftableProjectService extends ProjectService {
  deleteDraft(draftId: string): Promise<AxiosResponse>;
  getDraft(draftId: string): Promise<AxiosResponse<Draft<unknown>>>;
  getDrafts(): Promise<AxiosResponse>;
  upsertDraft(data?: Partial<Draft<unknown>>): Promise<AxiosResponse>;
}
