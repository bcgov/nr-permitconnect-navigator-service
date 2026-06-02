import { appAxios } from './interceptors';
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
  SearchGeneralProjectsRequest,
  Statistics,
  UpsertDraftRequest,
  SubmitDraftGeneralProjectRequest
} from '@/types';
import type { FormSchemaType } from '@/validators/general/projectIntakeFormSchema';

const PATH = `${Initiative.GENERAL.toLowerCase()}/project`;

export interface GeneralProjectService extends DraftableProjectService<GeneralProject, FormSchemaType> {
  getProject(req: GetProjectRequest): Promise<GeneralProject>;
  deleteDraft(req: DeleteDraftRequest): Promise<void>;
  getDraft(req: GetDraftRequest): Promise<Draft<FormSchemaType>>;
  getDrafts(): Promise<Draft<FormSchemaType>[]>;
  searchProjects(req: SearchGeneralProjectsRequest): Promise<GeneralProject[]>;
  upsertDraft(req: UpsertDraftRequest): Promise<Draft<FormSchemaType>>;
  submitDraft(req: SubmitDraftGeneralProjectRequest): Promise<GeneralProject>;
}

/**
 * Creates a new housing project.
 * @param req - The request payload containing the project data to create.
 * @returns A promise resolving to the created `GeneralProject` resource.
 */
export async function createProject(req: CreateGeneralProjectRequest): Promise<GeneralProject> {
  const { ...body } = req;

  const { data } = await appAxios().post<GeneralProject>(PATH, body);

  return data;
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
 * Retrieves all activity IDs associated with housing projects.
 * @returns A promise resolving to an array of activity IDs.
 */
export async function getActivityIds(): Promise<string[]> {
  const { data } = await appAxios().get<string[]>(`${PATH}/activityIds`);

  return data;
}

/**
 * Retrieves a single housing project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the requested `GeneralProject` resource.
 */
export async function getProject(req: GetProjectRequest): Promise<GeneralProject> {
  const { projectId } = req;

  const { data } = await appAxios().get<GeneralProject>(`${PATH}/${projectId}`);

  return data;
}

/**
 * Retrieves all housing projects.
 * @returns A promise resolving to an array of `GeneralProject` resources.
 */
export async function listProjects(): Promise<GeneralProject[]> {
  const { data } = await appAxios().get<GeneralProject[]>(PATH);

  return data;
}

/**
 * Searches housing projects using the supplied filters.
 * @param req - The request payload containing optional search criteria.
 * @returns A promise resolving to an array of `GeneralProject` resources.
 */
export async function searchProjects(req: SearchGeneralProjectsRequest): Promise<GeneralProject[]> {
  const { data } = await appAxios().post<GeneralProject[]>(`${PATH}/search`, req);

  return data;
}

/**
 * Updates an existing housing project.
 * @param req - The request payload containing the project ID and updated fields.
 * @returns A promise resolving to the updated `GeneralProject` resource.
 */
export async function patchProject(req: PatchGeneralProjectRequest): Promise<GeneralProject> {
  const { projectId, ...body } = req;

  const { data } = await appAxios().patch<GeneralProject>(`${PATH}/${projectId}`, body);

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
 * Submits a draft as a housing project.
 * @param req - The request payload containing the project data to submit.
 * @returns A promise resolving to the submitted `GeneralProject` resource.
 */
export async function submitDraft(req: SubmitDraftGeneralProjectRequest): Promise<GeneralProject> {
  const { ...body } = req;

  const { data } = await appAxios().put<GeneralProject>(`${PATH}/draft/submit`, body);

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
export async function getDrafts(): Promise<Draft<FormSchemaType>[]> {
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

/** Hybrid default export object for backward compatibility */
const generalProjectService: GeneralProjectService = {
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
  getDrafts,
  upsertDraft
};

export default generalProjectService;
