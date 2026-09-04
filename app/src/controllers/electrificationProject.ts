import { deleteActivityService } from '#src/services/activity';
import { deleteDraftService, getDraftService, listDraftsService, upsertDraftService } from '#src/services/draft';
import {
  createElectrificationProjectService,
  getElectrificationProjectService,
  getElectrificationProjectStatisticsService,
  listElectrificationProjectActivityIdsService,
  listElectrificationProjectsService,
  patchElectrificationProjectService,
  searchElectrificationProjects,
  submitElectrificationProjectDraftService
} from '#src/services/electrificationProject';
import { Initiative } from '#src/utils/enums/application';
import { DraftCode } from '#src/utils/enums/projectCommon';
import { isTruthy } from '#src/utils/utils';

import type { Request, Response } from 'express';
import type {
  Draft,
  DraftBase,
  ElectrificationProject,
  ElectrificationProjectStatistics,
  GetProjectStatisticsRequest,
  LocalContext,
  PatchElectrificationProjectRequest,
  SearchElectrificationProjectRequest,
  SubmitElectrificationProjectDraftRequest,
  UpsertElectrificationProjectDraftRequest
} from '#types';

export const createElectrificationProjectController = async (
  _req: Request,
  res: Response<ElectrificationProject, LocalContext>
) => {
  const result = await createElectrificationProjectService(res.locals.currentContext);
  res.status(201).json(result);
};

export const deleteElectrificationProjectController = async (
  req: Request<{ electrificationProjectId: string }>,
  res: Response
) => {
  const project = await getElectrificationProjectService(req.params.electrificationProjectId);
  await deleteActivityService(project.activityId);
  res.status(204).end();
};

export const getElectrificationProjectController = async (
  req: Request<{ electrificationProjectId: string }>,
  res: Response<ElectrificationProject>
) => {
  const response = await getElectrificationProjectService(req.params.electrificationProjectId);
  res.status(200).json(response);
};

export const getElectrificationProjectStatisticsController = async (
  req: Request<never, never, never, GetProjectStatisticsRequest>,
  res: Response<ElectrificationProjectStatistics>
) => {
  const response = await getElectrificationProjectStatisticsService(req.query);
  res.status(200).json(response[0]);
};

export const listElectrificationProjectActivityIdsController = async (_req: Request, res: Response) => {
  const response = await listElectrificationProjectActivityIdsService();
  res.status(200).json(response);
};

export const listElectrificationProjectsController = async (
  _req: Request,
  res: Response<ElectrificationProject[], LocalContext>
) => {
  const response = await listElectrificationProjectsService(res.locals.currentAuthorization, res.locals.currentContext);
  res.status(200).json(response);
};

export const searchElectrificationProjectsController = async (
  req: Request<never, never, SearchElectrificationProjectRequest>,
  res: Response<ElectrificationProject[], LocalContext>
) => {
  const response = await searchElectrificationProjects(res.locals.currentAuthorization, res.locals.currentContext, {
    ...req.body,
    includeUser: isTruthy(req.body.includeUser)
  });
  res.status(200).json(response);
};

export const patchElectrificationProjectController = async (
  req: Request<{ electrificationProjectId: string }, never, PatchElectrificationProjectRequest>,
  res: Response
) => {
  const response = await patchElectrificationProjectService(req.params.electrificationProjectId, req.body);
  res.status(200).json(response);
};

//--------------------------------------------------------------------------------
// Drafts
//--------------------------------------------------------------------------------

export const deleteElectrificationProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  await deleteDraftService(req.params.draftId);
  res.status(204).end();
};

export const getElectrificationProjectDraftController = async (
  req: Request<{ draftId: string }>,
  res: Response<Draft>
) => {
  const response = await getDraftService(req.params.draftId);
  res.status(200).json(response);
};

export const getElectrificationProjectDraftsController = async (req: Request, res: Response<Draft[], LocalContext>) => {
  const response = await listDraftsService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    DraftCode.ELECTRIFICATION_PROJECT
  );
  res.status(200).json(response);
};

export const submitElectrificationProjectDraftController = async (
  req: Request<never, never, SubmitElectrificationProjectDraftRequest>,
  res: Response<ElectrificationProject, LocalContext>
) => {
  const response = await submitElectrificationProjectDraftService(
    req.body.draftId,
    req.body,
    req.body.contact,
    res.locals.currentContext
  );
  res.status(201).json(response);
};

export const upsertElectrificationProjectDraftController = async (
  req: Request<never, never, UpsertElectrificationProjectDraftRequest>,
  res: Response<Draft, LocalContext>
) => {
  const update = !!req.body.draftId;
  const response = await upsertDraftService(
    req.body.draftId,
    { data: req.body.data as DraftBase['data'] },
    Initiative.ELECTRIFICATION,
    DraftCode.ELECTRIFICATION_PROJECT,
    res.locals.currentContext
  );
  res.status(update ? 200 : 201).json(response);
};
