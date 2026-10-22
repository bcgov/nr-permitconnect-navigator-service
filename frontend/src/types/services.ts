import type { ApiInitiative, QueryParams, RequestBody } from './api/openapi';
import type { ProjectStatistics, SearchProjectsResponse } from './api/responses';
import type { Draft } from './api/resources';

export interface ProjectService<T> {
  createProject(req: RequestBody<`create${ApiInitiative}Project`>): Promise<T>;
  deleteProject(req: { projectId: string }): Promise<void>;
  getProject(req: { projectId: string }): Promise<T>;
  getProjectStatistics(req: QueryParams<`get${ApiInitiative}ProjectStatistics`>): Promise<ProjectStatistics>;
  listActivityIds(): Promise<string[]>;
  listProjects(): Promise<T[]>;
  searchProjects(req: RequestBody<`search${ApiInitiative}Projects`>): Promise<SearchProjectsResponse>;
}

export interface DraftableProjectService<T, U> extends ProjectService<T> {
  deleteDraft(req: { draftId: string }): Promise<void>;
  getDraft(req: { draftId: string }): Promise<Draft<U>>;
  listDrafts(): Promise<Draft<U>[]>;
  upsertDraft(req: RequestBody<`upsert${ApiInitiative}ProjectDraft`>): Promise<Draft<U>>;
}
