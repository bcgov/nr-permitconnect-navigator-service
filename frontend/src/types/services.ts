import type { ProjectStatistics } from './api/reports';
import type {
  CreateProjectRequest,
  DeleteDraftRequest,
  DeleteProjectRequest,
  GetDraftRequest,
  GetProjectRequest,
  GetProjectStatisticsRequest,
  PatchProjectRequest,
  UpsertDraftRequest
} from './api/requests';
import type { Draft } from './api/resources';

export interface ProjectService<T> {
  createProject(req: CreateProjectRequest): Promise<T>;
  deleteProject(req: DeleteProjectRequest): Promise<void>;
  getProject(req: GetProjectRequest): Promise<T>;
  getProjectStatistics(req: GetProjectStatisticsRequest): Promise<ProjectStatistics>;
  listActivityIds(): Promise<string[]>;
  listProjects(): Promise<T[]>;
  patchProject(req: PatchProjectRequest): Promise<T>;
  searchProjects(filters?: unknown): Promise<T[]>;
  submitDraft(req: unknown): Promise<T>;
}

export interface DraftableProjectService<T, U> extends ProjectService<T> {
  deleteDraft(req: DeleteDraftRequest): Promise<void>;
  getDraft(req: GetDraftRequest): Promise<Draft<U>>;
  listDrafts(): Promise<Draft<U>[]>;
  upsertDraft(req: UpsertDraftRequest): Promise<Draft<U>>;
}
