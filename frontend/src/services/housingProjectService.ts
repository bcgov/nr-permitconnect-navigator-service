import { appAxios } from './interceptors';
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

const PATH = `${Initiative.HOUSING.toLowerCase()}/project`;

export interface HousingProjectService extends DraftableProjectService<HousingProject, FormSchemaType> {
  deleteDraft(req: DeleteDraftRequest): Promise<void>;
  getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>>;
  getProject(req: GetProjectRequest): Promise<HousingProject>;
  listDrafts(): Promise<Draft<FormSchemaType>[]>;
  searchProjects(req: ListHousingProjectRequest): Promise<HousingProject[]>;
  submitDraft(req: SubmitDraftHousingProjectRequest): Promise<HousingProject>;
  upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>>;
}

/**
 * Creates a new housing project.
 * @param req - The request payload containing the project data to create.
 * @returns A promise resolving to the created `HousingProject` resource.
 */
export async function createProject(req: CreateHousingProjectRequest): Promise<HousingProject> {
  const { ...body } = req;

  const { data } = await appAxios().post<HousingProject>(PATH, body);

  return data;
}

/**
 * Deletes a draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteDraft(req: DeleteDraftRequest): Promise<void> {
  const { draftId } = req;

  await appAxios().delete(`${PATH}/draft/${draftId}`);
}

/**
 * Deletes a housing project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteProject(req: DeleteProjectRequest): Promise<void> {
  const { projectId } = req;

  await appAxios().delete(`${PATH}/${projectId}`);
}

/**
 * Retrieves a single draft.
 * @param req - The request payload containing the draft ID.
 * @returns A promise resolving to the requested draft resource.
 */
export async function getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>> {
  const { draftId } = req;

  const { data } = await appAxios().get<Draft<FormSchemaType>>(`${PATH}/draft/${draftId}`);

  return data;
}

/**
 * Retrieves a single housing project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the requested `HousingProject` resource.
 */
export async function getProject(req: GetProjectRequest): Promise<HousingProject> {
  const { projectId } = req;

  const { data } = await appAxios().get<HousingProject>(`${PATH}/${projectId}`);

  return data;
}

/**
 * Retrieves project statistics.
 * @param req - The request payload containing optional statistic filters.
 * @returns A promise resolving to project statistics.
 */
export async function getProjectStatistics(req: GetProjectStatisticsRequest): Promise<ProjectStatistics> {
  const { ...filters } = req;

  const { data } = await appAxios().get<ProjectStatistics>(`${PATH}/statistics`, {
    params: filters
  });

  return data;
}

/**
 * Retrieves all activity IDs associated with housing projects.
 * @returns A promise resolving to an array of activity IDs.
 */
export async function listActivityIds(): Promise<string[]> {
  const { data } = await appAxios().get<string[]>(`${PATH}/activityIds`);

  return data;
}

/**
 * Retrieves all drafts.
 * @returns A promise resolving to an array of draft resources.
 */
export async function listDrafts(): Promise<Draft<FormSchemaType>[]> {
  const { data } = await appAxios().get<Draft<FormSchemaType>[]>(`${PATH}/draft`);

  return data;
}

/**
 * Retrieves all housing projects.
 * @returns A promise resolving to an array of `HousingProject` resources.
 */
export async function listProjects(): Promise<HousingProject[]> {
  const { data } = await appAxios().get<HousingProject[]>(PATH);

  return data;
}

/**
 * Updates an existing housing project.
 * @param req - The request payload containing the project ID and updated fields.
 * @returns A promise resolving to the updated `HousingProject` resource.
 */
export async function patchProject(req: PatchHousingProjectRequest): Promise<HousingProject> {
  const { projectId, ...body } = req;

  const { data } = await appAxios().patch<HousingProject>(`${PATH}/${projectId}`, body);

  return data;
}

/**
 * Searches housing projects using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `HousingProject` resources.
 */
export async function searchProjects(req: ListHousingProjectRequest): Promise<HousingProject[]> {
  const { data } = await appAxios().post<HousingProject[]>(`${PATH}/search`, req);

  return data;
}

/**
 * Submits a draft as a housing project.
 * @param req - The request payload containing the project data to submit.
 * @returns A promise resolving to the submitted `HousingProject` resource.
 */
export async function submitDraft(req: SubmitDraftHousingProjectRequest): Promise<HousingProject> {
  const { ...body } = req;

  const { data } = await appAxios().put<HousingProject>(`${PATH}/draft/submit`, body);

  return data;
}

/**
 * Creates or updates a draft.
 * @param req - The request payload containing the draft data.
 * @returns A promise resolving to the saved draft resource.
 */
export async function upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>> {
  const { ...body } = req;

  const { data } = await appAxios().put<Draft<FormSchemaType>>(`${PATH}/draft`, body);

  return data;
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
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
