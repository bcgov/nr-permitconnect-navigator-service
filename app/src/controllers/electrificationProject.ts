import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import {
  generateCreateStamps,
  generateDeleteStamps,
  generateNullDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps
} from '../db/utils/utils';
import { createActivity, deleteActivity } from '../services/activity';
import { createDraft, deleteDraft, getDraft, getDrafts, updateDraft } from '../services/draft';
import { email } from '../services/email';
import {
  createElectrificationProject,
  deleteElectrificationProject,
  getElectrificationProject,
  getElectrificationProjects,
  getElectrificationProjectStatistics,
  searchElectrificationProjects,
  updateElectrificationProject
} from '../services/electrificationProject';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, DraftCode, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
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
} from '../types';

/**
 * Handles creating a project from intake data
 */
const generateElectrificationProjectData = async (
  tx: PrismaTransactionClient,
  data: ElectrificationProjectIntake,
  currentContext: CurrentContext
) => {
  const activityId =
    data.project.activityId ??
    (await createActivity(tx, Initiative.ELECTRIFICATION, generateCreateStamps(currentContext)))?.activityId;

  // Put new electrification project together
  const electrificationProjectData: ElectrificationProject = {
    ...data.project,
    electrificationProjectId: uuidv4(),
    activityId: activityId,
    submittedAt: new Date(),
    submissionType: SubmissionType.GUIDANCE,
    intakeStatus: IntakeStatus.SUBMITTED,
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
  let response = await transactionWrapper<ElectrificationProject[]>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProjects(tx);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response.map((x) => x.activityId));
};

export const createElectrificationProjectController = async (
  req: Request<never, never, ElectrificationProjectIntake>,
  res: Response
) => {
  // TODO: Remove when create PUT calls get switched to POST
  if (req.body === undefined) {
    req.body = {
      project: {
        projectName: null,
        projectDescription: null,
        companyNameRegistered: null,
        projectType: null,
        bcHydroNumber: null
      }
    };
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
    await deleteDraft(tx, req.params.draftId);
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
  let response = await transactionWrapper<Draft[]>(async (tx: PrismaTransactionClient) => {
    return await getDrafts(tx, DraftCode.ELECTRIFICATION_PROJECT);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x: Draft) => x?.createdBy === req.currentContext.userId);
  }

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
  let response = await transactionWrapper<ElectrificationProject[]>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProjects(tx);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x: ElectrificationProject) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response);
};

export const searchElectrificationProjectsController = async (
  req: Request<never, never, never, ElectrificationProjectSearchParameters>,
  res: Response
) => {
  let response = await transactionWrapper<ElectrificationProject[]>(async (tx: PrismaTransactionClient) => {
    return await searchElectrificationProjects(tx, {
      ...req.query,
      includeUser: isTruthy(req.query.includeUser)
    });
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x: ElectrificationProject) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response);
};

export const submitElectrificationProjectDraftController = async (
  req: Request<never, never, ElectrificationProjectIntake>,
  res: Response
) => {
  const result = await transactionWrapper<ElectrificationProject>(async (tx: PrismaTransactionClient) => {
    const electrificationProject = await generateElectrificationProjectData(tx, req.body, req.currentContext);

    // Create new electrification project
    const data = await createElectrificationProject(tx, {
      ...electrificationProject,
      ...generateCreateStamps(req.currentContext)
    });

    // Delete old draft
    if (req.body.draftId) await deleteDraft(tx, req.body.draftId);

    return data;
  });

  res.status(201).json({ activityId: result.activityId, electrificationProjectId: result.electrificationProjectId });
};

export const updateElectrificationProjectDraftController = async (req: Request<never, never, Draft>, res: Response) => {
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

      return await createDraft(tx, {
        draftId: uuidv4(),
        activityId: activityId,
        draftCode: DraftCode.ELECTRIFICATION_PROJECT,
        data: req.body.data,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });
    }
  });

  res.status(update ? 200 : 201).json({ draftId: response?.draftId, activityId: response?.activityId });
};

export const updateElectrificationProjectController = async (
  req: Request<never, never, { project: ElectrificationProject; contacts: Array<Contact> }>,
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
