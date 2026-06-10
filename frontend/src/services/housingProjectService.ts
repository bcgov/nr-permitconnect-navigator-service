import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';
import { Initiative } from '@/utils/enums/application';

import type {
  CreateHousingProjectRequest,
  DeleteDraftRequest,
  DeleteProjectRequest,
  Draft,
  DraftableProjectService,
  GetDraftRequest,
  GetProjectRequest,
  GetProjectStatisticsRequest,
  HousingProject,
  PatchHousingProjectRequest,
  ProjectStatistics,
  ListHousingProjectRequest,
  SubmitDraftHousingProjectRequest,
  UpsertDraftRequest
} from '@/types';
import type { FormSchemaType } from '@/validators/housing/projectIntakeFormSchema';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const housingProjectRoute = createRouteBuilder(`${Initiative.HOUSING.toLowerCase()}/project`);

const housingProjectRoutes = {
  root: () => housingProjectRoute(),
  byId: (id: string) => housingProjectRoute(id),

  draft: () => housingProjectRoute('draft'),
  draftById: (id: string) => housingProjectRoute('draft', id),
  submitDraft: () => housingProjectRoute('draft', 'submit'),

  search: () => housingProjectRoute('search'),
  statistics: () => housingProjectRoute('statistics'),
  activityIds: () => housingProjectRoute('activityIds')
} as const;

/**
 * Creates a new housing project.
 * @param req - The request payload containing the project data to create.
 * @returns A promise resolving to the created `HousingProject` resource.
 */
export function createProject(req: CreateHousingProjectRequest): Promise<HousingProject> {
  const { ...body } = req;

  return api.post<HousingProject>(housingProjectRoutes.root(), body);
}

/**
 * Deletes a draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving when the operation completes.
 */
export function deleteDraft(req: DeleteDraftRequest): Promise<void> {
  const { draftId } = req;

  return api.delete(housingProjectRoutes.draftById(draftId));
}

/**
 * Deletes a housing project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving when the operation completes.
 */
export function deleteProject(req: DeleteProjectRequest): Promise<void> {
  const { projectId } = req;

  return api.delete(housingProjectRoutes.byId(projectId));
}

/**
 * Retrieves a single draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving to the requested draft resource.
 */
export function getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>> {
  const { draftId } = req;

  return api.get<Draft<FormSchemaType>>(housingProjectRoutes.draftById(draftId));
}

/**
 * Retrieves a single housing project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the requested `HousingProject` resource.
 */
export function getProject(req: GetProjectRequest): Promise<HousingProject> {
  const { projectId } = req;

  return api.get<HousingProject>(housingProjectRoutes.byId(projectId));
}

/**
 * Retrieves project statistics.
 * @param req - The request payload containing optional statistic filters.
 * @returns A promise resolving to project statistics.
 */
export function getProjectStatistics(req: GetProjectStatisticsRequest): Promise<ProjectStatistics> {
  const { ...filters } = req;

  return api.get<ProjectStatistics>(housingProjectRoutes.statistics(), {
    params: filters
  });
}

/**
 * Retrieves all activity IDs associated with housing projects.
 * @returns A promise resolving to an array of activity IDs.
 */
export function listActivityIds(): Promise<string[]> {
  return api.get<string[]>(housingProjectRoutes.activityIds());
}

/**
 * Retrieves all drafts.
 * @returns A promise resolving to an array of draft resources.
 */
export function listDrafts(): Promise<Draft<FormSchemaType>[]> {
  return api.get<Draft<FormSchemaType>[]>(housingProjectRoutes.draft());
}

/**
 * Retrieves all housing projects.
 * @returns A promise resolving to an array of `HousingProject` resources.
 */
export function listProjects(): Promise<HousingProject[]> {
  return api.get<HousingProject[]>(housingProjectRoutes.root());
}

/**
 * Updates an existing housing project.
 * @param req - The request payload containing the project ID and updated fields.
 * @returns A promise resolving to the updated `HousingProject` resource.
 */
export function patchProject(req: PatchHousingProjectRequest): Promise<HousingProject> {
  const { projectId, ...body } = req;

  return api.patch<HousingProject>(housingProjectRoutes.byId(projectId), body);
}

/**
 * Searches housing projects using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `HousingProject` resources.
 */
export function searchProjects(req: ListHousingProjectRequest): Promise<HousingProject[]> {
  return api.post<HousingProject[]>(housingProjectRoutes.search(), req);
}

/**
 * Submits a draft as a housing project.
 * @param req - The request payload containing the project data to submit.
 * @returns A promise resolving to the submitted `HousingProject` resource.
 */
export function submitDraft(req: SubmitDraftHousingProjectRequest): Promise<HousingProject> {
  const { ...body } = req;

  return api.put<HousingProject>(housingProjectRoutes.submitDraft(), body);
}

/**
 * Creates or updates a draft.
 * @param req - The request payload containing the draft data.
 * @returns A promise resolving to the saved draft resource.
 */
export function upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>> {
  const { ...body } = req;

  return api.put<Draft<FormSchemaType>>(housingProjectRoutes.draft(), body);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export interface HousingProjectService extends DraftableProjectService<HousingProject, FormSchemaType> {
  deleteDraft(req: DeleteDraftRequest): Promise<void>;
  getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>>;
  getProject(req: GetProjectRequest): Promise<HousingProject>;
  listDrafts(): Promise<Draft<FormSchemaType>[]>;
  searchProjects(req: ListHousingProjectRequest): Promise<HousingProject[]>;
  submitDraft(req: SubmitDraftHousingProjectRequest): Promise<HousingProject>;
  upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>>;
}

export const housingProjectService: HousingProjectService = {
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
