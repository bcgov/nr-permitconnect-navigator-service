import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  generateCreateStamps,
  generateNullDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps
} from '../db/utils/utils.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import { createActivity } from '../services/activity.ts';
import { createActivityContact } from '../services/activityContact.ts';
import { searchContactsService, upsertContactsService } from '../services/contact.ts';
import {
  createDraft,
  deleteDraftService,
  getDraft,
  getDrafts,
  getDraftService,
  listDraftsService,
  updateDraft
} from '../services/draft.ts';
import {
  createHousingProjectService,
  deleteHousingProjectService,
  getHousingProjectService,
  getHousingProjectStatisticsService,
  listHousingProjectActivityIdsService,
  listHousingProjectsService,
  searchHousingProjects,
  updateHousingProjectService
} from '../services/housingProject.ts';
import { upsertPermit } from '../services/permit.ts';
import { upsertPermitTracking } from '../services/permitTracking.ts';
import { BasicResponse, Initiative } from '../utils/enums/application.ts';
import { ActivityContactRole, DraftCode } from '../utils/enums/projectCommon.ts';
import { isTruthy, omit } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/database.ts';
import type {
  Contact,
  Draft,
  HousingProject,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  HousingProjectStatistics,
  LocalContext,
  Permit,
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
  await deleteHousingProjectService(req.params.housingProjectId);
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

export const listHousingProjectActivityIdsController = async (req: Request, res: Response) => {
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
  res: Response
) => {
  const result = await transactionWrapper<HousingProject & { contact: Contact }>(
    async (tx: PrismaTransactionClient) => {
      const { housingProject, appliedPermits, investigatePermits } = await generateHousingProjectData(
        tx,
        req.body,
        res.locals.currentContext
      );

      // Create new housing project
      const data = await createHousingProject(tx, {
        ...housingProject,
        ...generateCreateStamps(res.locals.currentContext)
      });

      // Create each permit and tracking IDs
      await Promise.all(
        appliedPermits.map(async (p: Permit) => {
          await upsertPermit(tx, omit(p, ['permitTracking']));
        })
      );
      await Promise.all(investigatePermits.map(async (p: Permit) => await upsertPermit(tx, p)));
      await Promise.all(
        appliedPermits
          .filter((p: Permit) => !!p.permitTracking)
          .map(async (p: Permit) => await upsertPermitTracking(tx, p))
      );

      // Delete old draft
      if (req.body.draftId) await deleteDraft(tx, req.body.draftId);

      // Update the contact
      const contactResponse = await upsertContactsService([
        { ...req.body.contact, ...generateUpdateStamps(res.locals.currentContext) }
      ]);

      return { ...data, contact: contactResponse[0] };
    }
  );
  await emailProjectConfirmation(result);
  res.status(201).json({ ...result, contact: result.contact });
};

export const upsertHousingProjectDraftController = async (req: Request<never, never, Draft>, res: Response) => {
  const update = !!req.body.draftId;

  const response = await transactionWrapper<Draft>(async (tx: PrismaTransactionClient) => {
    if (update) {
      // Update draft
      return await updateDraft(tx, {
        ...req.body,
        ...generateUpdateStamps(res.locals.currentContext)
      });
    } else {
      // Create new draft
      const activityId = (await createActivity(tx, Initiative.HOUSING, generateCreateStamps(res.locals.currentContext)))
        ?.activityId;

      const draft = await createDraft(tx, {
        draftId: uuidv4(),
        activityId: activityId,
        draftCode: DraftCode.HOUSING_PROJECT,
        data: req.body.data,
        ...generateCreateStamps(res.locals.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });

      // Link contact to activity
      const contacts = await searchContactsService({ userId: [res.locals.currentContext.userId!] });
      if (contacts[0]) {
        await createActivityContact(tx, draft.activityId, contacts[0].contactId, ActivityContactRole.PRIMARY);
      }

      return draft;
    }
  });

  res.status(update ? 200 : 201).json(response);
};
