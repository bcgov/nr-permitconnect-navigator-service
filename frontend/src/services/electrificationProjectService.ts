import { appAxios } from './interceptors';
import { Initiative } from '@/utils/enums/application';

import type {
  CreateElectrificationProjectRequest,
  DeleteDraftRequest,
  DeleteProjectRequest,
  Draft,
  DraftableProjectService,
  ElectrificationProject,
  GetDraftRequest,
  GetProjectRequest,
  GetProjectStatisticsRequest,
  PatchElectrificationProjectRequest,
  ListElectrificationProjectsRequest,
  Statistics,
  UpsertDraftRequest,
  SubmitDraftElectrificationProjectRequest
} from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectIntakeFormSchema';

const PATH = `${Initiative.ELECTRIFICATION.toLowerCase()}/project`;

export interface ElectrificationProjectService extends DraftableProjectService<ElectrificationProject, FormSchemaType> {
  getProject(req: GetProjectRequest): Promise<ElectrificationProject>;
  deleteDraft(req: DeleteDraftRequest): Promise<void>;
  getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>>;
  listDrafts(): Promise<Draft<FormSchemaType>[]>;
  searchProjects(req: ListElectrificationProjectsRequest): Promise<ElectrificationProject[]>;
  upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>>;
  submitDraft(req: SubmitDraftElectrificationProjectRequest): Promise<ElectrificationProject>;
}

/**
 * Creates a new general project.
 * @param req - The request payload containing the project data to create.
 * @returns A promise resolving to the created `ElectrificationProject` resource.
 */
export async function createProject(req: CreateElectrificationProjectRequest): Promise<ElectrificationProject> {
  const { ...body } = req;

  const { data } = await appAxios().post<ElectrificationProject>(PATH, body);

  return data;
}

/**
 * Deletes a general project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteProject(req: DeleteProjectRequest): Promise<void> {
  const { projectId } = req;

  await appAxios().delete(`${PATH}/${projectId}`);
}

/**
 * Retrieves all activity IDs associated with general projects.
 * @returns A promise resolving to an array of activity IDs.
 */
export async function getActivityIds(): Promise<string[]> {
  const { data } = await appAxios().get<string[]>(`${PATH}/activityIds`);

  return data;
}

/**
 * Retrieves a single general project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the requested `ElectrificationProject` resource.
 */
export async function getProject(req: GetProjectRequest): Promise<ElectrificationProject> {
  const { projectId } = req;

  const { data } = await appAxios().get<ElectrificationProject>(`${PATH}/${projectId}`);

  return data;
}

/**
 * Retrieves all general projects.
 * @returns A promise resolving to an array of `ElectrificationProject` resources.
 */
export async function listProjects(): Promise<ElectrificationProject[]> {
  const { data } = await appAxios().get<ElectrificationProject[]>(PATH);

  return data;
}

/**
 * Searches general projects using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `ElectrificationProject` resources.
 */
export async function searchProjects(req: ListElectrificationProjectsRequest): Promise<ElectrificationProject[]> {
  const { data } = await appAxios().post<ElectrificationProject[]>(`${PATH}/search`, req);

  return data;
}

/**
 * Updates an existing general project.
 * @param req - The request payload containing the project ID and updated fields.
 * @returns A promise resolving to the updated `ElectrificationProject` resource.
 */
export async function patchProject(req: PatchElectrificationProjectRequest): Promise<ElectrificationProject> {
  const { projectId, ...body } = req;

  const { data } = await appAxios().patch<ElectrificationProject>(`${PATH}/${projectId}`, body);

  return data;
}

/**
 * Retrieves project statistics.
 * @param req - The request payload containing optional statistic filters.
 * @returns A promise resolving to project statistics.
 */
export async function getStatistics(req: GetProjectStatisticsRequest): Promise<Statistics> {
  const { ...filters } = req;

  const { data } = await appAxios().get<Statistics>(`${PATH}/statistics`, {
    params: filters
  });

  return data;
}

/**
 * Submits a draft as a general project.
 * @param req - The request payload containing the project data to submit.
 * @returns A promise resolving to the submitted `ElectrificationProject` resource.
 */
export async function submitDraft(req: SubmitDraftElectrificationProjectRequest): Promise<ElectrificationProject> {
  const { ...body } = req;

  const { data } = await appAxios().put<ElectrificationProject>(`${PATH}/draft/submit`, body);

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
 * Retrieves all drafts.
 * @returns A promise resolving to an array of draft resources.
 */
export async function listDrafts(): Promise<Draft<FormSchemaType>[]> {
  const { data } = await appAxios().get<Draft<FormSchemaType>[]>(`${PATH}/draft`);

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
export const electrificationProjectService: ElectrificationProjectService = {
  createProject,
  deleteProject,
  getActivityIds,
  getProject,
  listProjects,
  searchProjects,
  patchProject,
  getStatistics,
  submitDraft,
  deleteDraft,
  getDraft,
  listDrafts,
  upsertDraft
};
