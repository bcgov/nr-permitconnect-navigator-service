import { deleteActivityService } from '#src/services/activity';
import { deleteDraftService, getDraftService, listDraftsService, upsertDraftService } from '#src/services/draft';
import {
  createGeneralProjectService,
  getGeneralProjectService,
  getGeneralProjectStatisticsService,
  listGeneralProjectActivityIdsService,
  listGeneralProjectsService,
  patchGeneralProjectService,
  searchGeneralProjects,
  submitGeneralProjectDraftService
} from '#src/services/generalProject';
import { Initiative } from '#src/utils/enums/application';
import { DraftCode } from '#src/utils/enums/projectCommon';
import { isTruthy } from '#src/utils/utils';

import type { Request, Response } from 'express';
import type {
  Draft,
  DraftBase,
  GeneralProject,
  GetProjectStatisticsRequest,
  LocalContext,
  PatchGeneralProjectRequest,
  SearchGeneralProjectRequest,
  SubmitGeneralProjectDraftRequest,
  UpsertGeneralProjectDraftRequest
} from '#types';

export const createGeneralProjectController = async (_req: Request, res: Response<GeneralProject, LocalContext>) => {
  const result = await createGeneralProjectService(res.locals.currentContext);
  res.status(201).json(result);
};

export const deleteGeneralProjectController = async (req: Request<{ generalProjectId: string }>, res: Response) => {
  const project = await getGeneralProjectService(req.params.generalProjectId);
  await deleteActivityService(project.activityId);
  res.status(204).end();
};

export const getGeneralProjectController = async (req: Request<{ generalProjectId: string }>, res: Response) => {
  const response = await getGeneralProjectService(req.params.generalProjectId);
  res.status(200).json(response);
};

export const getGeneralProjectStatisticsController = async (
  req: Request<never, never, never, GetProjectStatisticsRequest>,
  res: Response
) => {
  const response = await getGeneralProjectStatisticsService(req.query);
  res.status(200).json(response[0]);
};

export const listGeneralProjectActivityIdsController = async (_req: Request, res: Response) => {
  const response = await listGeneralProjectActivityIdsService();
  res.status(200).json(response);
};

export const listGeneralProjectsController = async (_req: Request, res: Response<GeneralProject[], LocalContext>) => {
  const response = await listGeneralProjectsService(res.locals.currentAuthorization, res.locals.currentContext);
  res.status(200).json(response);
};

export const searchGeneralProjectsController = async (
  req: Request<never, never, SearchGeneralProjectRequest>,
  res: Response<GeneralProject[], LocalContext>
) => {
  const response = await searchGeneralProjects(res.locals.currentAuthorization, res.locals.currentContext, {
    ...req.body,
    includeUser: isTruthy(req.body.includeUser)
  });
  res.status(200).json(response);
};

export const patchGeneralProjectController = async (
  req: Request<{ generalProjectId: string }, never, PatchGeneralProjectRequest>,
  res: Response
) => {
  const response = await patchGeneralProjectService(req.params.generalProjectId, req.body);
  res.status(200).json(response);
};

//--------------------------------------------------------------------------------
// Drafts
//--------------------------------------------------------------------------------

export const deleteGeneralProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  await deleteDraftService(req.params.draftId);
  res.status(204).end();
};

export const getGeneralProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  const response = await getDraftService(req.params.draftId);
  res.status(200).json(response);
};

export const getGeneralProjectDraftsController = async (req: Request, res: Response<Draft[], LocalContext>) => {
  const response = await listDraftsService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    DraftCode.GENERAL_PROJECT
  );
  res.status(200).json(response);
};

export const submitGeneralProjectDraftController = async (
  req: Request<never, never, SubmitGeneralProjectDraftRequest>,
  res: Response<GeneralProject, LocalContext>
) => {
  const response = await submitGeneralProjectDraftService(
    req.body.draftId,
    req.body,
    req.body.contact,
    res.locals.currentContext
  );
  res.status(201).json(response);
};

export const upsertGeneralProjectDraftController = async (
  req: Request<never, never, UpsertGeneralProjectDraftRequest>,
  res: Response<Draft, LocalContext>
) => {
  const update = !!req.body.draftId;
  const response = await upsertDraftService(
    req.body.draftId,
    { data: req.body.data as DraftBase['data'] },
    Initiative.GENERAL,
    DraftCode.GENERAL_PROJECT,
    res.locals.currentContext
  );
  res.status(update ? 200 : 201).json(response);
};
