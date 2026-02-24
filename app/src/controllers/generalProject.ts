import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  generateCreateStamps,
  generateDeleteStamps,
  generateNullDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps,
  jsonToPrismaInputJson
} from '../db/utils/utils.ts';
import { createActivity, deleteActivity, deleteActivityHard } from '../services/activity.ts';
import { createActivityContact } from '../services/activityContact.ts';
import { searchContacts, upsertContacts } from '../services/contact.ts';
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
import { upsertPermitTracking } from '../services/permitTracking.ts';
import { BasicResponse, Initiative } from '../utils/enums/application.ts';
import { PermitNeeded, PermitStage, PermitState } from '../utils/enums/permit.ts';
import { ActivityContactRole, ApplicationStatus, DraftCode, SubmissionType } from '../utils/enums/projectCommon.ts';
import { isTruthy, omit } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type {
  Contact,
  CurrentContext,
  Draft,
  Email,
  GeneralProject,
  GeneralProjectIntake,
  GeneralProjectSearchParameters,
  GeneralProjectStatistics,
  Permit,
  StatisticsFilters
} from '../types/index.ts';

const generateGeneralProjectData = async (
  tx: PrismaTransactionClient,
  data: GeneralProjectIntake,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required
  if (!activityId) {
    activityId = (await createActivity(tx, Initiative.GENERAL, generateCreateStamps(currentContext)))?.activityId;
    const contacts = await searchContacts(tx, { userId: [currentContext.userId!] });
    if (contacts[0]) await createActivityContact(tx, activityId, contacts[0].contactId, ActivityContactRole.PRIMARY);
  }

  let basic, general, location, permits;
  let appliedPermits: Permit[] = [],
    investigatePermits: Permit[] = [];

  if (data.basic) {
    basic = {
      consentToFeedback: data.basic.consentToFeedback ?? false,
      projectApplicantType: data.basic.projectApplicantType,
      companyIdRegistered: data.basic.registeredId,
      companyNameRegistered: data.basic.registeredName
    };
  }

  if (data.general) {
    general = {
      projectName: data.general.projectName,
      projectDescription: data.general.projectDescription
    };
  }

  if (data.location) {
    location = {
      naturalDisaster: (data.location.naturalDisaster as BasicResponse) === BasicResponse.YES ? true : false,
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
  }

  if (data.appliedPermits?.length) {
    appliedPermits = data.appliedPermits.map((x: Permit) => ({
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
      submittedDate: x.submittedDate,
      submittedTime: x.submittedTime,
      decisionDate: null,
      decisionTime: null,
      permitTracking: x.permitTracking?.map((pt) => ({
        ...pt,
        ...generateCreateStamps(currentContext)
      })),
      ...generateCreateStamps(currentContext),
      ...generateUpdateStamps(currentContext),
      ...generateNullDeleteStamps()
    }));
  }

  if (data.investigatePermits?.length) {
    investigatePermits = data.investigatePermits.map((x: Permit) => ({
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
      submittedDate: null,
      submittedTime: x.submittedTime,
      decisionDate: null,
      decisionTime: null,
      ...generateCreateStamps(currentContext),
      ...generateUpdateStamps(currentContext),
      ...generateNullDeleteStamps()
    }));
  }

  // Put new general project together
  const generalProjectData = {
    generalProject: {
      ...basic,
      ...general,
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
      astUpdated: false,
      addedToAts: false,
      atsClientId: null,
      ltsaCompleted: false,
      bcOnlineCompleted: false,
      checkProvincialPermits: null,
      atsEnquiryId: null
    } as GeneralProject,
    appliedPermits,
    investigatePermits
  };

  return generalProjectData;
};

/**
 * Send an email with the confirmation of general project
 * @param req Express Request object
 * @param res Express Response object
 */
export const emailGeneralProjectConfirmationController = async (req: Request<never, never, Email>, res: Response) => {
  const { data, status } = await email(req.body);
  res.status(status).json(data);
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
      req.currentContext
    );

    // Create new general project
    const data = await createGeneralProject(tx, {
      ...generalProject,
      ...generateCreateStamps(req.currentContext)
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
    await deleteGeneralProject(tx, req.params.generalProjectId, generateDeleteStamps(req.currentContext));
    await deleteActivity(tx, project.activityId, generateDeleteStamps(req.currentContext));
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

export const getGeneralProjectDraftsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<Draft[]>(async (tx: PrismaTransactionClient) => {
    return await getDrafts(tx, DraftCode.GENERAL_PROJECT);
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

export const getGeneralProjectsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<GeneralProject[]>(async (tx: PrismaTransactionClient) => {
    return await getGeneralProjects(tx);
  });
  res.status(200).json(response);
};

export const searchGeneralProjectsController = async (
  req: Request<never, never, GeneralProjectSearchParameters | undefined, never>,
  res: Response
) => {
  const response = await transactionWrapper<GeneralProject[]>(async (tx: PrismaTransactionClient) => {
    return await searchGeneralProjects(tx, {
      ...req.body,
      includeUser: isTruthy(req.body?.includeUser)
    });
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
        req.currentContext
      );

      // Create new general project
      const data = await createGeneralProject(tx, {
        ...generalProject,
        ...generateCreateStamps(req.currentContext)
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
      const contactResponse = await upsertContacts(tx, [
        { ...req.body.contact, ...generateUpdateStamps(req.currentContext) }
      ]);

      return { ...data, contact: contactResponse[0] };
    }
  );

  res.status(201).json({ ...result, contact: result.contact });
};

export const upsertGeneralProjectDraftController = async (req: Request<never, never, Draft>, res: Response) => {
  const update = req.body.draftId && req.body.activityId;

  const response = await transactionWrapper<Draft>(async (tx: PrismaTransactionClient) => {
    if (update) {
      // Update draft
      return await updateDraft(tx, {
        ...req.body,
        ...generateUpdateStamps(req.currentContext)
      });
    } else {
      // Create new draft
      const activityId = (await createActivity(tx, Initiative.GENERAL, generateCreateStamps(req.currentContext)))
        ?.activityId;

      const draft = await createDraft(tx, {
        draftId: uuidv4(),
        activityId: activityId,
        draftCode: DraftCode.GENERAL_PROJECT,
        data: req.body.data,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });

      // Link contact to activity
      const contacts = await searchContacts(tx, { userId: [req.currentContext.userId!] });
      if (contacts[0]) {
        await createActivityContact(tx, draft.activityId, contacts[0].contactId, ActivityContactRole.PRIMARY);
      }

      return draft;
    }
  });

  res.status(update ? 200 : 201).json(response);
};

export const updateGeneralProjectController = async (req: Request<never, never, GeneralProject>, res: Response) => {
  const response = await transactionWrapper<GeneralProject>(async (tx: PrismaTransactionClient) => {
    return await updateGeneralProject(tx, {
      ...req.body,
      ...generateUpdateStamps(req.currentContext)
    });
  });

  res.status(200).json(response);
};
