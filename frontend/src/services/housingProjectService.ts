import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';
import { Initiative } from '@/utils/enums/application';

import type {
  Draft,
  DraftableProjectService,
  HousingProject,
  ProjectStatistics,
  QueryParams,
  RequestBody,
  SearchProjectsResponse
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
export function createProject(req: RequestBody<'createHousingProject'>): Promise<HousingProject> {
  const { ...body } = req;

  return api.post<HousingProject>(housingProjectRoutes.root(), body);
}

/**
 * Deletes a draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving when the operation completes.
 */
export function deleteDraft(req: { draftId: string }): Promise<void> {
  const { draftId } = req;

  return api.delete(housingProjectRoutes.draftById(draftId));
}

/**
 * Deletes a housing project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving when the operation completes.
 */
export function deleteProject(req: { projectId: string }): Promise<void> {
  const { projectId } = req;

  return api.delete(housingProjectRoutes.byId(projectId));
}

/**
 * Retrieves a single draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving to the requested draft resource.
 */
export function getDraft(req: { draftId: string }): Promise<Draft<FormSchemaType>> {
  const { draftId } = req;

  return api.get<Draft<FormSchemaType>>(housingProjectRoutes.draftById(draftId));
}

/**
 * Retrieves a single housing project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the requested `HousingProject` resource.
 */
export function getProject(req: { projectId: string }): Promise<HousingProject> {
  const { projectId } = req;

  return api.get<HousingProject>(housingProjectRoutes.byId(projectId));
}

/**
 * Retrieves project statistics.
 * @param req - The request payload containing optional statistic filters.
 * @returns A promise resolving to project statistics.
 */
export function getProjectStatistics(req: QueryParams<'getHousingProjectStatistics'>): Promise<ProjectStatistics> {
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
export function patchProject(req: { projectId: string } & RequestBody<'patchHousingProject'>): Promise<HousingProject> {
  const { projectId, ...body } = req;

  return api.patch<HousingProject>(housingProjectRoutes.byId(projectId), body);
}

/**
 * Searches housing projects using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `HousingProject` resources.
 */
export function searchProjects(req: RequestBody<'searchHousingProjects'>): Promise<SearchProjectsResponse> {
  return api.post<SearchProjectsResponse>(housingProjectRoutes.search(), req);
}

/**
 * Submits a draft as a housing project.
 * @param req - The request payload containing the project data to submit.
 * @returns A promise resolving to the submitted `HousingProject` resource.
 */
export function submitDraft(req: RequestBody<'submitHousingProjectDraft'>): Promise<HousingProject> {
  const { ...body } = req;

  return api.post<HousingProject>(housingProjectRoutes.submitDraft(), body);
}

/**
 * Creates or updates a draft.
 * @param req - The request payload containing the draft data.
 * @returns A promise resolving to the saved draft resource.
 */
export function upsertDraft(req: RequestBody<'upsertHousingProjectDraft'>): Promise<Draft<FormSchemaType>> {
  const { ...body } = req;

  return api.post<Draft<FormSchemaType>>(housingProjectRoutes.draft(), body);
}

export interface HousingProjectService extends DraftableProjectService<HousingProject, FormSchemaType> {
  patchProject: typeof patchProject;
  submitDraft: typeof submitDraft;
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
