import { Prisma } from '@prisma/client';

import { deleteActivityService } from '../services/activity.ts';

import { deleteDraftService, getDraftService, listDraftsService, upsertDraftService } from '../services/draft.ts';
import {
  createElectrificationProjectService,
  getElectrificationProjectService,
  getElectrificationProjectStatisticsService,
  listElectrificationProjectActivityIdsService,
  listElectrificationProjectsService,
  searchElectrificationProjects,
  submitElectrificationProjectDraftService,
  updateElectrificationProjectService
} from '../services/electrificationProject.ts';
import { Initiative } from '../utils/enums/application.ts';
import { DraftCode } from '../utils/enums/projectCommon.ts';
import { isTruthy } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type {
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  ElectrificationProjectStatistics,
  LocalContext,
  StatisticsFilters
} from '../types/index.ts';

export const createElectrificationProjectController = async (
  req: Request<never, never, ElectrificationProjectIntake>,
  res: Response<ElectrificationProject, LocalContext>
) => {
  // Provide an empty body if POST body is given undefined
  req.body ??= {} as ElectrificationProjectIntake;

  const result = await createElectrificationProjectService(req.body, res.locals.currentContext);
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
  req: Request<never, never, never, StatisticsFilters>,
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
  req: Request<never, never, ElectrificationProjectSearchParameters | undefined, never>,
  res: Response<ElectrificationProject[], LocalContext>
) => {
  const response = await searchElectrificationProjects(res.locals.currentAuthorization, res.locals.currentContext, {
    ...req.body,
    includeUser: isTruthy(req.body?.includeUser)
  });
  res.status(200).json(response);
};

export const updateElectrificationProjectController = async (
  req: Request<
    { electrificationProjectId: string },
    never,
    Omit<Prisma.electrification_projectUpdateInput, 'electrificationProjectId'>
  >,
  res: Response
) => {
  const response = await updateElectrificationProjectService(
    {
      ...req.body
    },
    req.params.electrificationProjectId
  );
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
  req: Request<never, never, ElectrificationProjectIntake>,
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
  req: Request<never, never, Draft>,
  res: Response<Draft, LocalContext>
) => {
  const update = !!req.body.draftId;
  const response = await upsertDraftService(
    req.body.draftId,
    req.body,
    Initiative.ELECTRIFICATION,
    DraftCode.ELECTRIFICATION_PROJECT,
    res.locals.currentContext
  );
  res.status(update ? 200 : 201).json(response);
};
