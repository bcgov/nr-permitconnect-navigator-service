import { Prisma } from '@prisma/client';

import { deleteDraftService, getDraftService, listDraftsService, upsertDraftService } from '../services/draft.ts';
import {
  createGeneralProjectService,
  deleteGeneralProjectService,
  getGeneralProjectService,
  getGeneralProjectStatisticsService,
  listGeneralProjectActivityIdsService,
  listGeneralProjectsService,
  searchGeneralProjects,
  submitGeneralProjectDraftService,
  updateGeneralProjectService
} from '../services/generalProject.ts';
import { Initiative } from '../utils/enums/application.ts';
import { DraftCode } from '../utils/enums/projectCommon.ts';
import { isTruthy } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type {
  Draft,
  GeneralProject,
  GeneralProjectIntake,
  GeneralProjectSearchParameters,
  LocalContext,
  StatisticsFilters
} from '../types/index.ts';

export const createGeneralProjectController = async (
  req: Request<never, never, GeneralProjectIntake>,
  res: Response<GeneralProject, LocalContext>
) => {
  // Provide an empty body if POST body is given undefined
  req.body ??= {} as GeneralProjectIntake;

  const result = await createGeneralProjectService(req.body, res.locals.currentContext);
  res.status(201).json(result);
};

export const deleteGeneralProjectController = async (req: Request<{ generalProjectId: string }>, res: Response) => {
  await deleteGeneralProjectService(req.params.generalProjectId);
  res.status(204).end();
};

export const getGeneralProjectController = async (req: Request<{ generalProjectId: string }>, res: Response) => {
  const response = await getGeneralProjectService(req.params.generalProjectId);
  res.status(200).json(response);
};

export const getGeneralProjectStatisticsController = async (
  req: Request<never, never, never, StatisticsFilters>,
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
  req: Request<never, never, GeneralProjectSearchParameters | undefined, never>,
  res: Response<GeneralProject[], LocalContext>
) => {
  const response = await searchGeneralProjects(res.locals.currentAuthorization, res.locals.currentContext, {
    ...req.body,
    includeUser: isTruthy(req.body?.includeUser)
  });
  res.status(200).json(response);
};

export const updateGeneralProjectController = async (
  req: Request<{ generalProjectId: string }, never, Omit<Prisma.general_projectUpdateInput, 'generalProjectId'>>,
  res: Response
) => {
  const response = await updateGeneralProjectService(
    {
      ...req.body
    },
    req.params.generalProjectId
  );
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
  req: Request<never, never, GeneralProjectIntake>,
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
  req: Request<never, never, Draft>,
  res: Response<Draft, LocalContext>
) => {
  const update = !!req.body.draftId;
  const response = await upsertDraftService(
    req.body.draftId,
    req.body,
    Initiative.GENERAL,
    DraftCode.GENERAL_PROJECT,
    res.locals.currentContext
  );
  res.status(update ? 200 : 201).json(response);
};
