import { deleteActivityService } from '#src/services/activity';
import { deleteDraftService, getDraftService, listDraftsService, upsertDraftService } from '#src/services/draft';
import {
  createHousingProjectService,
  getHousingProjectService,
  getHousingProjectStatisticsService,
  listHousingProjectActivityIdsService,
  listHousingProjectsService,
  patchHousingProjectService,
  searchHousingProjects,
  submitHousingProjectDraftService
} from '#src/services/housingProject';
import { Initiative } from '#src/utils/enums/application';
import { DraftCode } from '#src/utils/enums/projectCommon';
import { isTruthy } from '#src/utils/utils';

import type { Request, Response } from 'express';
import type {
  Draft,
  DraftBase,
  GetProjectStatisticsRequest,
  HousingProject,
  HousingProjectIntake,
  HousingProjectStatistics,
  SearchHousingProjectRequest,
  LocalContext,
  PatchHousingProjectRequest,
  UpsertHousingProjectDraftRequest
} from '#types';

// TODO: HousingProjectIntake is hand-written, not z.infer'd from the zod schema - it can drift from
// what's actually validated (e.g. schema.createHousingProject.body has `location: z.unknown()` and
// optional contact/basic/housing, while this interface claims them required/structured). Swapping to
// a real inferred type also needs a fix in the shared ContactRepository (Prisma checked/unchecked
// create-input union), so it's not containable to this file alone.
export const createHousingProjectController = async (
  req: Request<never, never, HousingProjectIntake>,
  res: Response<HousingProject, LocalContext>
) => {
  const result = await createHousingProjectService(req.body, res.locals.currentContext);
  res.status(201).json(result);
};

export const deleteHousingProjectController = async (req: Request<{ housingProjectId: string }>, res: Response) => {
  const project = await getHousingProjectService(req.params.housingProjectId);
  await deleteActivityService(project.activityId);
  res.status(204).end();
};

export const getHousingProjectController = async (
  req: Request<{ housingProjectId: string }>,
  res: Response<HousingProject>
) => {
  const response = await getHousingProjectService(req.params.housingProjectId);
  res.status(200).json(response);
};

export const getHousingProjectStatisticsController = async (
  req: Request<never, never, never, GetProjectStatisticsRequest>,
  res: Response<HousingProjectStatistics>
) => {
  const response = await getHousingProjectStatisticsService(req.query);
  res.status(200).json(response[0]);
};

export const listHousingProjectActivityIdsController = async (_req: Request, res: Response) => {
  const response = await listHousingProjectActivityIdsService();
  res.status(200).json(response);
};

export const listHousingProjectsController = async (_req: Request, res: Response<HousingProject[], LocalContext>) => {
  const response = await listHousingProjectsService(res.locals.currentAuthorization, res.locals.currentContext);
  res.status(200).json(response);
};

export const searchHousingProjectsController = async (
  req: Request<never, never, SearchHousingProjectRequest>,
  res: Response<HousingProject[], LocalContext>
) => {
  const response = await searchHousingProjects(res.locals.currentAuthorization, res.locals.currentContext, {
    ...req.body,
    includeUser: isTruthy(req.body.includeUser)
  });
  res.status(200).json(response);
};

export const patchHousingProjectController = async (
  req: Request<{ housingProjectId: string }, never, PatchHousingProjectRequest>,
  res: Response
) => {
  const response = await patchHousingProjectService(req.params.housingProjectId, req.body);
  res.status(200).json(response);
};

//--------------------------------------------------------------------------------
// Drafts
//--------------------------------------------------------------------------------

export const deleteHousingProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  await deleteDraftService(req.params.draftId);
  res.status(204).end();
};

export const getHousingProjectDraftController = async (req: Request<{ draftId: string }>, res: Response<Draft>) => {
  const response = await getDraftService(req.params.draftId);
  res.status(200).json(response);
};

export const getHousingProjectDraftsController = async (req: Request, res: Response<Draft[], LocalContext>) => {
  const response = await listDraftsService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    DraftCode.HOUSING_PROJECT
  );
  res.status(200).json(response);
};

// TODO: same HousingProjectIntake-vs-zod-schema drift as createHousingProjectController above.
export const submitHousingProjectDraftController = async (
  req: Request<never, never, HousingProjectIntake>,
  res: Response<HousingProject, LocalContext>
) => {
  const response = await submitHousingProjectDraftService(
    req.body.draftId,
    req.body,
    req.body.contact,
    res.locals.currentContext
  );
  res.status(201).json(response);
};

export const upsertHousingProjectDraftController = async (
  req: Request<never, never, UpsertHousingProjectDraftRequest>,
  res: Response<Draft, LocalContext>
) => {
  const update = !!req.body.draftId;
  const response = await upsertDraftService(
    req.body.draftId,
    { data: req.body.data as DraftBase['data'] },
    Initiative.HOUSING,
    DraftCode.HOUSING_PROJECT,
    res.locals.currentContext
  );
  res.status(update ? 200 : 201).json(response);
};
