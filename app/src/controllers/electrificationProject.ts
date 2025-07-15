import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateNullUpdateStamps, generateUpdateStamps } from '../db/utils/utils';

import { createActivity } from '../services/activity';
import { deleteUnmatchedActivityContacts, upsertActivityContacts } from '../services/activityContact';
import { insertContacts, upsertContacts } from '../services/contact';
import { createDraft, deleteDraft, getDraft, getDrafts, updateDraft } from '../services/draft';
import { email } from '../services/email';
import {
  createElectrificationProject,
  getElectrificationProject,
  getElectrificationProjects,
  getStatistics,
  searchElectrificationProjects,
  updateElectrificationProject,
  updateIsDeletedFlag
} from '../services/electrificationProject';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, DraftCode, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { partition, isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type {
  Contact,
  CurrentContext,
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  Email,
  StatisticsFilters
} from '../types';

/**
 * @function generateElectrificationProjectData
 * Handles creating a project from intake data
 */
const generateElectrificationProjectData = async (
  data: ElectrificationProjectIntake,
  currentContext: CurrentContext
) => {
  const activityId =
    data.project.activityId ??
    (await createActivity(Initiative.ELECTRIFICATION, generateCreateStamps(currentContext)))?.activityId;

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
    updatedAt: null
  };

  return electrificationProjectData;
};

/**
 * @function emailConfirmation
 * Send an email with the confirmation of electrification project
 */
export const emailConfirmationController = async (req: Request<never, never, Email>, res: Response) => {
  const { data, status } = await email(req.body);
  res.status(status).json(data);
};

export const getActivityIdsController = async (req: Request, res: Response) => {
  let response = await getElectrificationProjects();

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response.map((x: ElectrificationProject) => x.activityId));
};

export const createElectrificationProjectController = async (
  req: Request<never, never, ElectrificationProjectIntake>,
  res: Response
) => {
  // TODO: Remove when create PUT calls get switched to POST
  if (req.body === undefined) {
    req.body = { project: {} };
  }
  const electrificationProject = await generateElectrificationProjectData(req.body, req.currentContext);

  // Create contacts
  if (req.body.contacts) await upsertContacts(req.body.contacts, req.currentContext, electrificationProject.activityId);

  // Create new electrification project
  const result = await createElectrificationProject({
    ...electrificationProject,
    ...generateCreateStamps(req.currentContext)
  });

  res.status(201).json(result);
};

export const deleteDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  const response = await deleteDraft(req.params.draftId);
  res.status(200).json(response);
};

export const getDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  const response = await getDraft(req.params.draftId);

  res.status(200).json(response);
};

export const getDraftsController = async (req: Request, res: Response) => {
  let response = await getDrafts(DraftCode.ELECTRIFICATION_PROJECT);

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x: Draft) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response);
};

export const getStatisticsController = async (req: Request<never, never, never, StatisticsFilters>, res: Response) => {
  const response = await getStatistics(req.query);
  res.status(200).json(response[0]);
};

export const getElectrificationProjectController = async (
  req: Request<{ electrificationProjectId: string }>,
  res: Response
) => {
  const response = await getElectrificationProject(req.params.electrificationProjectId);

  if (!response) {
    return res.status(404).json({ message: 'Electrification Project not found' });
  }

  res.status(200).json(response);
};

export const getElectrificationProjectsController = async (req: Request, res: Response) => {
  let response = await getElectrificationProjects();

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x: ElectrificationProject) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response);
};

export const searchElectrificationProjectsController = async (
  req: Request<never, never, never, ElectrificationProjectSearchParameters>,
  res: Response
) => {
  let response = await searchElectrificationProjects({
    ...req.query,
    includeUser: isTruthy(req.query.includeUser),
    includeDeleted: isTruthy(req.query.includeDeleted)
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x: ElectrificationProject) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response);
};

export const submitDraftController = async (
  req: Request<never, never, ElectrificationProjectIntake>,
  res: Response
) => {
  const electrificationProject = await generateElectrificationProjectData(req.body, req.currentContext);

  // Create contacts
  if (req.body.contacts) await upsertContacts(req.body.contacts, req.currentContext, electrificationProject.activityId);

  // Create new electrification project
  const result = await createElectrificationProject({
    ...electrificationProject,
    ...generateCreateStamps(req.currentContext)
  });

  // Delete old draft
  if (req.body.draftId) await deleteDraft(req.body.draftId);

  res.status(201).json({ activityId: result.activityId, electrificationProjectId: result.electrificationProjectId });
};

export const updateDraftController = async (req: Request<never, never, Draft>, res: Response) => {
  const update = req.body.draftId && req.body.activityId;

  let response;

  if (update) {
    // Update draft
    response = await updateDraft({
      ...req.body,
      ...generateUpdateStamps(req.currentContext)
    });
  } else {
    const activityId = (await createActivity(Initiative.ELECTRIFICATION, generateCreateStamps(req.currentContext)))
      ?.activityId;

    // Create new draft
    response = await createDraft({
      draftId: uuidv4(),
      activityId: activityId,
      draftCode: DraftCode.ELECTRIFICATION_PROJECT,
      data: req.body.data,
      ...generateCreateStamps(req.currentContext),
      ...generateNullUpdateStamps()
    });
  }

  res.status(update ? 200 : 201).json({ draftId: response?.draftId, activityId: response?.activityId });
};

export const updateIsDeletedFlagController = async (
  req: Request<{ electrificationProjectId: string }, never, { isDeleted: boolean }>,
  res: Response
) => {
  const response = await updateIsDeletedFlag(
    req.params.electrificationProjectId,
    req.body.isDeleted,
    generateUpdateStamps(req.currentContext)
  );

  if (!response) {
    return res.status(404).json({ message: 'Electrification Project not found' });
  }

  res.status(200).json(response);
};

export const updateElectrificationProjectController = async (
  req: Request<never, never, { project: ElectrificationProject; contacts: Array<Contact> }>,
  res: Response
) => {
  if (req.body.contacts) {
    // Predicate function to check if a contact has a contactId.
    // Used to partition contacts into existing (with contactId) and new (without contactId).
    const hasContactId = (x: Contact) => !!x.contactId;

    // Partition contacts into existing and new based on whether they have a contactId
    const [existingContacts, newContacts] = partition(req.body.contacts, hasContactId);

    // Assign a new contactId to each new contact
    newContacts.forEach((x) => {
      x.contactId = uuidv4();
    });

    // Combine existing contacts with new contacts
    const contacts = existingContacts.concat(newContacts);

    // Insert new contacts into the contact table
    await insertContacts(newContacts, req.currentContext);

    // Delete any activity_contact records that doesn't match the activity and contacts in the request
    await deleteUnmatchedActivityContacts(req.body.project.activityId, contacts);

    // Create or update activity_contact with the data from the request
    await upsertActivityContacts(req.body.project.activityId, contacts);
  }

  const response = await updateElectrificationProject({
    ...req.body.project,
    ...generateUpdateStamps(req.currentContext)
  });

  if (!response) {
    return res.status(404).json({ message: 'Electrification Project not found' });
  }

  res.status(200).json(response);
};
