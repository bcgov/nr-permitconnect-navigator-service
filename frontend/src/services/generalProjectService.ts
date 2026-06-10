import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';
import { Initiative } from '@/utils/enums/application';

import type {
  CreateGeneralProjectRequest,
  DeleteDraftRequest,
  DeleteProjectRequest,
  Draft,
  DraftableProjectService,
  GetDraftRequest,
  GetProjectRequest,
  GetProjectStatisticsRequest,
  GeneralProject,
  PatchGeneralProjectRequest,
  ProjectStatistics,
  ListGeneralProjectsRequest,
  UpsertDraftRequest,
  SubmitDraftGeneralProjectRequest
} from '@/types';
import type { FormSchemaType } from '@/validators/general/projectIntakeFormSchema';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const generalProjectRoute = createRouteBuilder(`${Initiative.GENERAL.toLowerCase()}/project`);

const generalProjectRoutes = {
  root: () => generalProjectRoute(),
  byId: (id: string) => generalProjectRoute(id),

  draft: () => generalProjectRoute('draft'),
  draftById: (id: string) => generalProjectRoute('draft', id),
  submitDraft: () => generalProjectRoute('draft', 'submit'),

  search: () => generalProjectRoute('search'),
  statistics: () => generalProjectRoute('statistics'),
  activityIds: () => generalProjectRoute('activityIds')
} as const;

/**
 * Creates a new general project.
 * @param req - The request payload containing the project data to create.
 * @returns A promise resolving to the created `GeneralProject` resource.
 */
export function createProject(req: CreateGeneralProjectRequest): Promise<GeneralProject> {
  const { ...body } = req;

  return api.post<GeneralProject>(generalProjectRoutes.root(), body);
}

/**
 * Deletes a draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteDraft(req: DeleteDraftRequest): Promise<void> {
  const { draftId } = req;

  return api.delete(generalProjectRoutes.draftById(draftId));
}

/**
 * Deletes a general project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteProject(req: DeleteProjectRequest): Promise<void> {
  const { projectId } = req;

  return api.delete(generalProjectRoutes.byId(projectId));
}

/**
 * Retrieves a single draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving to the requested draft resource.
 */
export async function getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>> {
  const { draftId } = req;

  return api.get<Draft<FormSchemaType>>(generalProjectRoutes.draftById(draftId));
}

/**
 * Retrieves a single general project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the requested `GeneralProject` resource.
 */
export async function getProject(req: GetProjectRequest): Promise<GeneralProject> {
  const { projectId } = req;

  return api.get<GeneralProject>(generalProjectRoutes.byId(projectId));
}

/**
 * Retrieves project statistics.
 * @param req - The request payload containing optional statistic filters.
 * @returns A promise resolving to project statistics.
 */
export async function getProjectStatistics(req: GetProjectStatisticsRequest): Promise<ProjectStatistics> {
  const { ...filters } = req;

  return api.get<ProjectStatistics>(generalProjectRoutes.statistics(), {
    params: filters
  });
}

/**
 * Retrieves all activity IDs associated with general projects.
 * @returns A promise resolving to an array of activity IDs.
 */
export async function listActivityIds(): Promise<string[]> {
  return api.get<string[]>(generalProjectRoutes.activityIds());
}

/**
 * Retrieves all drafts.
 * @returns A promise resolving to an array of draft resources.
 */
export async function listDrafts(): Promise<Draft<FormSchemaType>[]> {
  return api.get<Draft<FormSchemaType>[]>(generalProjectRoutes.draft());
}

/**
 * Retrieves all general projects.
 * @returns A promise resolving to an array of `GeneralProject` resources.
 */
export async function listProjects(): Promise<GeneralProject[]> {
  return api.get<GeneralProject[]>(generalProjectRoutes.root());
}

/**
 * Updates an existing general project.
 * @param req - The request payload containing the project ID and updated fields.
 * @returns A promise resolving to the updated `GeneralProject` resource.
 */
export async function patchProject(req: PatchGeneralProjectRequest): Promise<GeneralProject> {
  const { projectId, ...body } = req;

  return api.patch<GeneralProject>(generalProjectRoutes.byId(projectId), body);
}

/**
 * Searches general projects using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `GeneralProject` resources.
 */
export async function searchProjects(req: ListGeneralProjectsRequest): Promise<GeneralProject[]> {
  return api.post<GeneralProject[]>(generalProjectRoutes.search(), req);
}

/**
 * Submits a draft as a general project.
 * @param req - The request payload containing the project data to submit.
 * @returns A promise resolving to the submitted `GeneralProject` resource.
 */
export async function submitDraft(req: SubmitDraftGeneralProjectRequest): Promise<GeneralProject> {
  const { ...body } = req;

  return api.put<GeneralProject>(generalProjectRoutes.submitDraft(), body);
}

/**
 * Creates or updates a draft.
 * @param req - The request payload containing the draft data.
 * @returns A promise resolving to the saved draft resource.
 */
export async function upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>> {
  const { ...body } = req;

  return api.put<Draft<FormSchemaType>>(generalProjectRoutes.draft(), body);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export interface GeneralProjectService extends DraftableProjectService<GeneralProject, FormSchemaType> {
  deleteDraft(req: DeleteDraftRequest): Promise<void>;
  getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>>;
  getProject(req: GetProjectRequest): Promise<GeneralProject>;
  listDrafts(): Promise<Draft<FormSchemaType>[]>;
  searchProjects(req: ListGeneralProjectsRequest): Promise<GeneralProject[]>;
  submitDraft(req: SubmitDraftGeneralProjectRequest): Promise<GeneralProject>;
  upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>>;
}

export const generalProjectService: GeneralProjectService = {
  createProject,
  deleteDraft,
  deleteProject,
  getDraft,
  getProject,
  getProjectStatistics,
  listActivityIds,
  listDrafts,
  listProjects,
  patchProject,
  searchProjects,
  submitDraft,
  upsertDraft
};
