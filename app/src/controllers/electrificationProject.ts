import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  generateCreateStamps,
  generateDeleteStamps,
  generateNullDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps
} from '../db/utils/utils.ts';
import { createActivity, deleteActivity, deleteActivityHard } from '../services/activity.ts';
import { createActivityContact } from '../services/activityContact.ts';
import { searchContacts, upsertContacts } from '../services/contact.ts';
import { createDraft, deleteDraft, getDraft, getDrafts, updateDraft } from '../services/draft.ts';
import { email } from '../services/email.ts';
import {
  createElectrificationProject,
  deleteElectrificationProject,
  getElectrificationProject,
  getElectrificationProjects,
  getElectrificationProjectStatistics,
  searchElectrificationProjects,
  updateElectrificationProject
} from '../services/electrificationProject.ts';
import { Initiative } from '../utils/enums/application.ts';
import {
  ActivityContactRole,
  ApplicationStatus,
  DraftCode,
  SubmissionType
} from '../utils/enums/projectCommon.ts';
import { isTruthy } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type {
  Contact,
  CurrentContext,
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  ElectrificationProjectStatistics,
  Email,
  StatisticsFilters
} from '../types/index.ts';

/**
 * Handles creating a project from intake data
 */
const generateElectrificationProjectData = async (
  tx: PrismaTransactionClient,
  data: ElectrificationProjectIntake,
  currentContext: CurrentContext
) => {
  let activityId = data.project.activityId;

  // Create activity and link contact if required
  if (!activityId) {
    activityId = (await createActivity(tx, Initiative.ELECTRIFICATION, generateCreateStamps(currentContext)))
      ?.activityId;
    const contacts = await searchContacts(tx, { userId: [currentContext.userId as string] });
    if (contacts[0]) await createActivityContact(tx, activityId, contacts[0].contactId, ActivityContactRole.PRIMARY);
  }

  // Put new electrification project together
  const electrificationProjectData: ElectrificationProject = {
    ...data.project,
    electrificationProjectId: uuidv4(),
    activityId: activityId,
    submittedAt: new Date(),
    submissionType: SubmissionType.GUIDANCE,
    applicationStatus: ApplicationStatus.NEW,
    aaiUpdated: false,
    addedToAts: false,
    projectCategory: null,
    locationDescription: null,
    hasEpa: null,
    megawatts: null,
    bcEnvironmentAssessNeeded: null,
    assignedUserId: null,
    astNotes: null,
    queuePriority: null,
    atsClientId: null,
    atsEnquiryId: null,
    createdBy: null,
    createdAt: null,
    updatedBy: null,
    updatedAt: null,
    deletedBy: null,
    deletedAt: null
  };

  return electrificationProjectData;
};

/**
 * Send an email with the confirmation of electrification project
 */
export const emailElectrificationProjectConfirmationController = async (
  req: Request<never, never, Email>,
  res: Response
) => {
  const { data, status } = await email(req.body);
  res.status(status).json(data);
};

export const getElectrificationProjectActivityIdsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<ElectrificationProject[]>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProjects(tx);
  });
  res.status(200).json(response.map((x) => x.activityId));
};

export const createElectrificationProjectController = async (
  req: Request<never, never, ElectrificationProjectIntake>,
  res: Response
) => {
  // Provide an empty body if POST body is given undefined
  if (req.body === undefined) {
    req.body = {
      project: {}
    } as ElectrificationProjectIntake;
  }

  const result = await transactionWrapper<ElectrificationProject>(async (tx: PrismaTransactionClient) => {
    const electrificationProject = await generateElectrificationProjectData(tx, req.body, req.currentContext);

    // Create new electrification project
    return await createElectrificationProject(tx, {
      ...electrificationProject,
      ...generateCreateStamps(req.currentContext)
    });
  });

  res.status(201).json(result);
};

export const deleteElectrificationProjectController = async (
  req: Request<{ electrificationProjectId: string }>,
  res: Response
) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const project = await getElectrificationProject(tx, req.params.electrificationProjectId);
    await deleteElectrificationProject(
      tx,
      req.params.electrificationProjectId,
      generateDeleteStamps(req.currentContext)
    );
    await deleteActivity(tx, project.activityId, generateDeleteStamps(req.currentContext));
  });
  res.status(204).end();
};

export const deleteElectrificationProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const draft = await getDraft(tx, req.params.draftId);
    await deleteActivityHard(tx, draft.activityId);
  });
  res.status(204).end();
};

export const getElectrificationProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  const response = await transactionWrapper<Draft>(async (tx: PrismaTransactionClient) => {
    return await getDraft(tx, req.params.draftId);
  });

  res.status(200).json(response);
};

export const getElectrificationProjectDraftsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<Draft[]>(async (tx: PrismaTransactionClient) => {
    return await getDrafts(tx, DraftCode.ELECTRIFICATION_PROJECT);
  });
  res.status(200).json(response);
};

export const getElectrificationProjectStatisticsController = async (
  req: Request<never, never, never, StatisticsFilters>,
  res: Response
) => {
  const response = await transactionWrapper<ElectrificationProjectStatistics[]>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProjectStatistics(tx, req.query);
  });
  res.status(200).json(response[0]);
};

export const getElectrificationProjectController = async (
  req: Request<{ electrificationProjectId: string }>,
  res: Response
) => {
  const response = await transactionWrapper<ElectrificationProject>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProject(tx, req.params.electrificationProjectId);
  });
  res.status(200).json(response);
};

export const getElectrificationProjectsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<ElectrificationProject[]>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProjects(tx);
  });
  res.status(200).json(response);
};

export const searchElectrificationProjectsController = async (
  req: Request<never, never, never, ElectrificationProjectSearchParameters>,
  res: Response
) => {
  const response = await transactionWrapper<ElectrificationProject[]>(async (tx: PrismaTransactionClient) => {
    return await searchElectrificationProjects(tx, {
      ...req.query,
      includeUser: isTruthy(req.query.includeUser)
    });
  });
  res.status(200).json(response);
};

export const submitElectrificationProjectDraftController = async (
  req: Request<never, never, ElectrificationProjectIntake>,
  res: Response
) => {
  const result = await transactionWrapper<ElectrificationProject & { contact: Contact }>(
    async (tx: PrismaTransactionClient) => {
      const electrificationProject = await generateElectrificationProjectData(tx, req.body, req.currentContext);

      // Create new electrification project
      const data = await createElectrificationProject(tx, {
        ...electrificationProject,
        ...generateCreateStamps(req.currentContext)
      });

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

export const upsertElectrificationProjectDraftController = async (req: Request<never, never, Draft>, res: Response) => {
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
      const activityId = (
        await createActivity(tx, Initiative.ELECTRIFICATION, generateCreateStamps(req.currentContext))
      )?.activityId;

      const draft = await createDraft(tx, {
        draftId: uuidv4(),
        activityId: activityId,
        draftCode: DraftCode.ELECTRIFICATION_PROJECT,
        data: req.body.data,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });

      // Update the contact and link to activity
      const contacts = await searchContacts(tx, { userId: [req.currentContext.userId as string] });
      if (contacts[0])
        await createActivityContact(tx, draft.activityId, contacts[0].contactId, ActivityContactRole.PRIMARY);

      return draft;
    }
  });

  res.status(update ? 200 : 201).json({ draftId: response?.draftId, activityId: response?.activityId });
};

export const updateElectrificationProjectController = async (
  req: Request<never, never, { project: ElectrificationProject; contacts: Contact[] }>,
  res: Response
) => {
  const response = await transactionWrapper<ElectrificationProject>(async (tx: PrismaTransactionClient) => {
    return await updateElectrificationProject(tx, {
      ...req.body.project,
      ...generateUpdateStamps(req.currentContext)
    });
  });

  res.status(200).json(response);
};
