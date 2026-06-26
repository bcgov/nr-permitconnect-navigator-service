import config from 'config';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { PermitStage, PermitState } from '../db/codes/enums.ts';
import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  generateCreateStamps,
  generateDeleteStamps,
  generateNullDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps,
  jsonToPrismaInputJson
} from '../db/utils/utils.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import { createActivity, deleteActivity, deleteActivityHard } from '../domains/activity.ts';
import { createActivityContact } from '../services/activityContact.ts';
import { searchContactsService, upsertContactsService } from '../services/contact.ts';
import { createDraft, deleteDraft, getDraft, getDrafts, updateDraft } from '../services/draft.ts';
import { email } from '../services/email.ts';
import {
  createGeneralProject,
  deleteGeneralProject,
  getGeneralProject,
  getGeneralProjects,
  getGeneralProjectStatistics,
  searchGeneralProjects,
  updateGeneralProject
} from '../services/generalProject.ts';
import { upsertPermit } from '../services/permit.ts';
import { upsertPermitTracking } from '../domains/permitTracking.ts';
import { BasicResponse, Initiative } from '../utils/enums/application.ts';
import { PermitNeeded } from '../utils/enums/permit.ts';
import { ActivityContactRole, ApplicationStatus, DraftCode, SubmissionType } from '../utils/enums/projectCommon.ts';
import { confirmationTemplateGeneralSubmission } from '../utils/templates.ts';
import { isTruthy, omit, toTitleCase } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/database.ts';
import type {
  Contact,
  CurrentContext,
  Draft,
  GeneralProject,
  GeneralProjectIntake,
  GeneralProjectSearchParameters,
  GeneralProjectStatistics,
  LocalContext,
  Permit,
  StatisticsFilters
} from '../types/index.ts';

/**
 * Generates and sends a templated email with the given data
 * @param projectWithContact Email data
 */
async function emailProjectConfirmation(projectWithContact: GeneralProject & { contact: Contact }) {
  const configCC = config.get<string>('server.ches.submission.cc');

  const body = confirmationTemplateGeneralSubmission({
    contactName:
      projectWithContact.contact?.firstName && projectWithContact.contact?.lastName
        ? `${projectWithContact.contact?.firstName} ${projectWithContact.contact?.lastName}`
        : '',
    initiative: toTitleCase(Initiative.GENERAL),
    activityId: projectWithContact.activityId,
    projectId: projectWithContact.generalProjectId
  });

  const emailData = {
    from: configCC,
    to: [projectWithContact.contact.email!],
    cc: [configCC],
    subject: 'Confirmation of Project Submission',
    bodyType: 'html',
    body: body
  };

  await email(emailData);
}

/**
 * Transforms intake data to match DB schema
 * @param tx Prismas transaction client
 * @param data Intake data
 * @param currentContext The current context of the Express request
 * @returns Transformed project and permit data
 */
const generateGeneralProjectData = async (
  tx: PrismaTransactionClient,
  data: GeneralProjectIntake,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required
  if (!activityId) {
    activityId = (await createActivity(tx, Initiative.GENERAL, generateCreateStamps(currentContext))).activityId;
    const contacts = await searchContactsService({ userId: [currentContext.userId!] });
    if (contacts[0]) await createActivityContact(tx, activityId, contacts[0].contactId, ActivityContactRole.PRIMARY);
  }

  let basic, location, permits;
  let appliedPermits: Permit[] = [],
    investigatePermits: Permit[] = [];

  if (data.basic) {
    basic = {
      projectApplicantType: data.basic.projectApplicantType,
      companyIdRegistered: data.basic.registeredId,
      companyNameRegistered: data.basic.registeredName,
      projectName: data.basic.projectName,
      projectNumber: data.basic.projectNumber,
      projectDescription: data.basic.projectDescription
    };
  }

  if (data.location) {
    location = {
      naturalDisaster: (data.location.naturalDisaster as BasicResponse) === BasicResponse.YES,
      projectLocation: data.location.projectLocation,
      projectLocationDescription: data.location.projectLocationDescription,
      geomarkUrl: data.location.geomarkUrl,
      geoJson: jsonToPrismaInputJson(data.location.geoJson),
      locationPids: data.location.ltsaPidLookup,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      streetAddress: data.location.streetAddress,
      locality: data.location.locality,
      province: data.location.province
    };
  }

  if (data.permits) {
    permits = {
      hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
    };

    if (data.permits.appliedPermits?.length) {
      appliedPermits = data.permits.appliedPermits.map((x: Permit) => ({
        permitId: x.permitId ?? uuidv4(),
        permitTypeId: x.permitTypeId,
        activityId: activityId,
        stage: PermitStage.APPLICATION_SUBMISSION,
        needed: PermitNeeded.YES,
        statusLastChanged: null,
        statusLastChangedTime: null,
        statusLastVerified: null,
        statusLastVerifiedTime: null,
        issuedPermitId: null,
        state: PermitState.IN_PROGRESS,
        onHoldCode: null,
        submittedDate: x.submittedDate,
        submittedTime: x.submittedTime,
        decisionDate: null,
        decisionTime: null,
        targetDate: null,
        targetDateDescription: null,
        permitTracking: x.permitTracking?.map((pt) => ({
          ...pt,
          ...generateCreateStamps(currentContext)
        })),
        ...generateCreateStamps(currentContext),
        ...generateUpdateStamps(currentContext),
        ...generateNullDeleteStamps()
      }));
    }

    if (data.permits.investigatePermits?.length) {
      investigatePermits = data.permits.investigatePermits.map((x: Permit) => ({
        permitId: x.permitId ?? uuidv4(),
        permitTypeId: x.permitTypeId,
        activityId: activityId,
        stage: PermitStage.PRE_SUBMISSION,
        needed: PermitNeeded.UNDER_INVESTIGATION,
        statusLastChanged: null,
        statusLastChangedTime: null,
        statusLastVerified: null,
        statusLastVerifiedTime: null,
        issuedPermitId: null,
        state: PermitState.NONE,
        onHoldCode: null,
        submittedDate: null,
        submittedTime: x.submittedTime,
        decisionDate: null,
        decisionTime: null,
        targetDate: null,
        targetDateDescription: null,
        ...generateCreateStamps(currentContext),
        ...generateUpdateStamps(currentContext),
        ...generateNullDeleteStamps()
      }));
    }
  }

  // Put new general project together
  const generalProjectData = {
    generalProject: {
      ...basic,
      ...location,
      ...permits,
      generalProjectId: uuidv4(),
      activityId: activityId,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
      applicationStatus: data.applicationStatus ?? ApplicationStatus.NEW,
      submissionType: data?.submissionType ?? SubmissionType.GUIDANCE,
      createdAt: null,
      createdBy: null,
      updatedAt: null,
      updatedBy: null,
      deletedAt: null,
      deletedBy: null,
      aaiUpdated: false,
      assignedUserId: null,
      queuePriority: null,
      relatedPermits: null,
      astNotes: null,
      atsClientId: null,
      checkProvincialPermits: null,
      atsEnquiryId: null,
      region: null,
      area: null,
      activityType: null,
      businessArea: null
    } as GeneralProject,
    appliedPermits,
    investigatePermits
  };

  return generalProjectData;
};

export const getGeneralProjectActivityIdsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<GeneralProject[]>(async (tx: PrismaTransactionClient) => {
    return await getGeneralProjects(tx);
  });
  res.status(200).json(response.map((x) => x.activityId));
};

export const createGeneralProjectController = async (
  req: Request<never, never, GeneralProjectIntake>,
  res: Response
) => {
  // Provide an empty body if POST body is given undefined
  req.body ??= {} as GeneralProjectIntake;

  const result = await transactionWrapper<GeneralProject>(async (tx: PrismaTransactionClient) => {
    const { generalProject, appliedPermits, investigatePermits } = await generateGeneralProjectData(
      tx,
      req.body,
      res.locals.currentContext
    );

    // Create new general project
    const data = await createGeneralProject(tx, {
      ...generalProject,
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

    return data;
  });

  res.status(201).json(result);
};

export const deleteGeneralProjectController = async (req: Request<{ generalProjectId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const project = await getGeneralProject(tx, req.params.generalProjectId);
    await deleteGeneralProject(tx, req.params.generalProjectId, generateDeleteStamps(res.locals.currentContext));
    await deleteActivity(tx, project.activityId, generateDeleteStamps(res.locals.currentContext));
  });

  res.status(204).end();
};

export const deleteGeneralProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const draft = await getDraft(tx, req.params.draftId);
    await deleteActivityHard(tx, draft.activityId);
  });
  res.status(204).end();
};

export const getGeneralProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  const response = await transactionWrapper<Draft>(async (tx: PrismaTransactionClient) => {
    return await getDraft(tx, req.params.draftId);
  });
  res.status(200).json(response);
};

export const getGeneralProjectDraftsController = async (req: Request, res: Response<Draft[], LocalContext>) => {
  const response = await transactionWrapper<Draft[]>(async (tx: PrismaTransactionClient) => {
    const drafts = await getDrafts(tx, DraftCode.GENERAL_PROJECT);
    return await filterActivityResponseByScope(tx, res.locals, drafts);
  });
  res.status(200).json(response);
};

export const getGeneralProjectStatisticsController = async (
  req: Request<never, never, never, StatisticsFilters>,
  res: Response
) => {
  const response = await transactionWrapper<GeneralProjectStatistics[]>(async (tx: PrismaTransactionClient) => {
    return await getGeneralProjectStatistics(tx, req.query);
  });
  res.status(200).json(response[0]);
};

export const getGeneralProjectController = async (req: Request<{ generalProjectId: string }>, res: Response) => {
  const response = await transactionWrapper<GeneralProject>(async (tx: PrismaTransactionClient) => {
    return await getGeneralProject(tx, req.params.generalProjectId);
  });
  res.status(200).json(response);
};

export const getGeneralProjectsController = async (req: Request, res: Response<GeneralProject[], LocalContext>) => {
  const response = await transactionWrapper<GeneralProject[]>(async (tx: PrismaTransactionClient) => {
    const projects = await getGeneralProjects(tx);
    return await filterActivityResponseByScope(tx, res.locals, projects);
  });
  res.status(200).json(response);
};

export const searchGeneralProjectsController = async (
  req: Request<never, never, GeneralProjectSearchParameters | undefined, never>,
  res: Response<GeneralProject[], LocalContext>
) => {
  const response = await transactionWrapper<GeneralProject[]>(async (tx: PrismaTransactionClient) => {
    const projects = await searchGeneralProjects(tx, {
      ...req.body,
      includeUser: isTruthy(req.body?.includeUser)
    });
    return await filterActivityResponseByScope(tx, res.locals, projects);
  });
  res.status(200).json(response);
};

export const submitGeneralProjectDraftController = async (
  req: Request<never, never, GeneralProjectIntake>,
  res: Response
) => {
  const result = await transactionWrapper<GeneralProject & { contact: Contact }>(
    async (tx: PrismaTransactionClient) => {
      const { generalProject, appliedPermits, investigatePermits } = await generateGeneralProjectData(
        tx,
        req.body,
        res.locals.currentContext
      );

      // Create new general project
      const data = await createGeneralProject(tx, {
        ...generalProject,
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

export const upsertGeneralProjectDraftController = async (req: Request<never, never, Draft>, res: Response) => {
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
      const activityId = (await createActivity(tx, Initiative.GENERAL, generateCreateStamps(res.locals.currentContext)))
        ?.activityId;

      const draft = await createDraft(tx, {
        draftId: uuidv4(),
        activityId: activityId,
        draftCode: DraftCode.GENERAL_PROJECT,
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

export const updateGeneralProjectController = async (
  req: Request<{ generalProjectId: string }, never, Omit<Prisma.general_projectUpdateInput, 'generalProjectId'>>,
  res: Response
) => {
  const response = await transactionWrapper<GeneralProject>(async (tx: PrismaTransactionClient) => {
    return await updateGeneralProject(
      tx,
      {
        ...req.body,
        ...generateUpdateStamps(res.locals.currentContext)
      },
      req.params.generalProjectId
    );
  });

  res.status(200).json(response);
};
