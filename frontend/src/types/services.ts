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
import type { Statistics } from './api/responses';

export interface ProjectService<T> {
  createProject(req: CreateProjectRequest): Promise<T>;
  deleteProject(req: DeleteProjectRequest): Promise<void>;
  getActivityIds(): Promise<string[]>;
  getProject(req: GetProjectRequest): Promise<T>;
  listProjects(): Promise<T[]>;
  getStatistics(req: GetProjectStatisticsRequest): Promise<Statistics>;
  searchProjects(filters?: unknown): Promise<T[]>;
  submitDraft(req: unknown): Promise<T>;
  patchProject(req: PatchProjectRequest): Promise<T>;
}

export interface DraftableProjectService<T, U> extends ProjectService<T> {
  deleteDraft(req: DeleteDraftRequest): Promise<void>;
  getDraft(req: GetDraftRequest): Promise<Draft<U>>;
  getDrafts(): Promise<Draft<U>[]>;
  upsertDraft(req: UpsertDraftRequest): Promise<Draft<U>>;
}
