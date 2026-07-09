import { Prisma } from '@prisma/client';

import { deleteActivityService } from '../services/activity.ts';
import { deleteDraftService, getDraftService, listDraftsService, upsertDraftService } from '../services/draft.ts';
import {
  createHousingProjectService,
  getHousingProjectService,
  getHousingProjectStatisticsService,
  listHousingProjectActivityIdsService,
  listHousingProjectsService,
  searchHousingProjects,
  submitHousingProjectDraftService,
  updateHousingProjectService
} from '../services/housingProject.ts';
import { BasicResponse, Initiative } from '../utils/enums/application.ts';
import { DraftCode } from '../utils/enums/projectCommon.ts';
import { isTruthy } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type {
  Draft,
  HousingProject,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  HousingProjectStatistics,
  LocalContext,
  StatisticsFilters
} from '../types/index.ts';

export const createHousingProjectController = async (
  req: Request<never, never, HousingProjectIntake>,
  res: Response<HousingProject, LocalContext>
) => {
  // Provide an empty body if POST body is given undefined
  req.body ??= {} as HousingProjectIntake;

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
  req: Request<never, never, never, StatisticsFilters>,
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
  req: Request<never, never, HousingProjectSearchParameters | undefined, never>,
  res: Response<HousingProject[], LocalContext>
) => {
  const response = await searchHousingProjects(res.locals.currentAuthorization, res.locals.currentContext, {
    ...req.body,
    includeUser: isTruthy(req.body?.includeUser)
  });
  res.status(200).json(response);
};

export const updateHousingProjectController = async (
  req: Request<{ housingProjectId: string }, never, Omit<Prisma.housing_projectUpdateInput, 'housingProjectId'>>,
  res: Response
) => {
  const response = await updateHousingProjectService(
    {
      ...req.body,
      financiallySupported: [
        req.body.financiallySupportedBc,
        req.body.financiallySupportedIndigenous,
        req.body.financiallySupportedNonProfit,
        req.body.financiallySupportedHousingCoop
      ].includes(BasicResponse.YES)
    },
    req.params.housingProjectId
  );
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
  req: Request<never, never, Draft>,
  res: Response<Draft, LocalContext>
) => {
  const update = !!req.body.draftId;
  const response = await upsertDraftService(
    req.body.draftId,
    req.body,
    Initiative.HOUSING,
    DraftCode.HOUSING_PROJECT,
    res.locals.currentContext
  );
  res.status(update ? 200 : 201).json(response);
};
