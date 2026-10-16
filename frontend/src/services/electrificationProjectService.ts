import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';
import { Initiative } from '@/utils/enums/application';

import type {
  RequestBody,
  QueryParams,
  Draft,
  DraftableProjectService,
  ElectrificationProject,
  ProjectStatistics,
  SearchProjectsResponse
} from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectIntakeFormSchema';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const electrificationProjectRoute = createRouteBuilder(`${Initiative.ELECTRIFICATION.toLowerCase()}/project`);

const electrificationProjectRoutes = {
  root: () => electrificationProjectRoute(),
  byId: (id: string) => electrificationProjectRoute(id),

  draft: () => electrificationProjectRoute('draft'),
  draftById: (id: string) => electrificationProjectRoute('draft', id),
  submitDraft: () => electrificationProjectRoute('draft', 'submit'),

  search: () => electrificationProjectRoute('search'),
  statistics: () => electrificationProjectRoute('statistics'),
  activityIds: () => electrificationProjectRoute('activityIds')
} as const;

/**
 * Creates a new general project.
 * @param req - The request payload containing the project data to create.
 * @returns A promise resolving to the created `ElectrificationProject` resource.
 */
export async function createProject(req: RequestBody<'createElectrificationProject'>): Promise<ElectrificationProject> {
  const { ...body } = req;

  return api.post<ElectrificationProject>(electrificationProjectRoutes.root(), body);
}

/**
 * Deletes a draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteDraft(req: { draftId: string }): Promise<void> {
  const { draftId } = req;

  return api.delete(electrificationProjectRoutes.draftById(draftId));
}

/**
 * Deletes a general project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteProject(req: { projectId: string }): Promise<void> {
  const { projectId } = req;

  return api.delete(electrificationProjectRoutes.byId(projectId));
}

/**
 * Retrieves a single draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving to the requested draft resource.
 */
export async function getDraft(req: { draftId: string }): Promise<Draft<FormSchemaType>> {
  const { draftId } = req;

  return api.get<Draft<FormSchemaType>>(electrificationProjectRoutes.draftById(draftId));
}

/**
 * Retrieves a single general project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the requested `ElectrificationProject` resource.
 */
export async function getProject(req: { projectId: string }): Promise<ElectrificationProject> {
  const { projectId } = req;

  return api.get<ElectrificationProject>(electrificationProjectRoutes.byId(projectId));
}

/**
 * Retrieves project statistics.
 * @param req - The request payload containing optional statistic filters.
 * @returns A promise resolving to project statistics.
 */
export async function getProjectStatistics(
  req: QueryParams<'getElectrificationProjectStatistics'>
): Promise<ProjectStatistics> {
  const { ...filters } = req;

  return api.get<ProjectStatistics>(electrificationProjectRoutes.statistics(), {
    params: filters
  });
}

/**
 * Retrieves all activity IDs associated with general projects.
 * @returns A promise resolving to an array of activity IDs.
 */
export async function listActivityIds(): Promise<string[]> {
  return api.get<string[]>(electrificationProjectRoutes.activityIds());
}

/**
 * Retrieves all drafts.
 * @returns A promise resolving to an array of draft resources.
 */
export async function listDrafts(): Promise<Draft<FormSchemaType>[]> {
  return api.get<Draft<FormSchemaType>[]>(electrificationProjectRoutes.draft());
}

/**
 * Retrieves all general projects.
 * @returns A promise resolving to an array of `ElectrificationProject` resources.
 */
export async function listProjects(): Promise<ElectrificationProject[]> {
  return api.get<ElectrificationProject[]>(electrificationProjectRoutes.root());
}

/**
 * Updates an existing general project.
 * @param req - The request payload containing the project ID and updated fields.
 * @returns A promise resolving to the updated `ElectrificationProject` resource.
 */
export async function patchProject(
  req: { projectId: string } & RequestBody<'patchElectrificationProject'>
): Promise<ElectrificationProject> {
  const { projectId, ...body } = req;

  return api.patch<ElectrificationProject>(electrificationProjectRoutes.byId(projectId), body);
}

/**
 * Searches general projects using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `ElectrificationProject` resources.
 */
export async function searchProjects(
  req: RequestBody<'searchElectrificationProjects'>
): Promise<SearchProjectsResponse> {
  return api.post<SearchProjectsResponse>(electrificationProjectRoutes.search(), req);
}

/**
 * Submits a draft as a general project.
 * @param req - The request payload containing the project data to submit.
 * @returns A promise resolving to the submitted `ElectrificationProject` resource.
 */
export async function submitDraft(
  req: RequestBody<'submitElectrificationProjectDraft'>
): Promise<ElectrificationProject> {
  const { ...body } = req;

  return api.post<ElectrificationProject>(electrificationProjectRoutes.submitDraft(), body);
}

/**
 * Creates or updates a draft.
 * @param req - The request payload containing the draft data.
 * @returns A promise resolving to the saved draft resource.
 */
export async function upsertDraft(
  req: RequestBody<'upsertElectrificationProjectDraft'>
): Promise<Draft<FormSchemaType>> {
  const { ...body } = req;

  return api.post<Draft<FormSchemaType>>(electrificationProjectRoutes.draft(), body);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export interface ElectrificationProjectService extends DraftableProjectService<ElectrificationProject, FormSchemaType> {
  patchProject: typeof patchProject;
  submitDraft: typeof submitDraft;
}

export const electrificationProjectService: ElectrificationProjectService = {
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
