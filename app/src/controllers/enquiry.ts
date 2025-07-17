import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateNullUpdateStamps, generateUpdateStamps } from '../db/utils/utils';

import { createActivity } from '../services/activity';
import { upsertContacts } from '../services/contact';
import {
  createEnquiry,
  getEnquiries,
  getEnquiry,
  getRelatedEnquiries,
  searchEnquiries,
  updateEnquiry,
  updateEnquiryIsDeletedFlag
} from '../services/enquiry';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, EnquirySubmittedMethod, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { getCurrentUsername, isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type { Enquiry, EnquiryIntake, EnquirySearchParameters } from '../types';

const generateEnquiryData = async (req: Request<never, never, EnquiryIntake>, intakeStatus: string) => {
  const data = req.body;

  const activityId =
    data.activityId ??
    (await createActivity(req.currentContext.initiative as Initiative, generateCreateStamps(req.currentContext)))
      ?.activityId;

  let basic;

  if (data.basic) {
    basic = {
      submissionType: data.basic.submissionType,
      relatedActivityId: data.basic.relatedActivityId,
      enquiryDescription: data.basic.enquiryDescription
    };
  }

  // Put new enquiry together
  return {
    ...basic,
    enquiryId: data.enquiryId ?? uuidv4(),
    activityId: activityId as string,
    submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submittedBy: getCurrentUsername(req.currentContext),
    intakeStatus: intakeStatus,
    enquiryStatus: data.enquiryStatus ?? ApplicationStatus.NEW,
    submissionType: data?.basic?.submissionType ?? SubmissionType.GENERAL_ENQUIRY
  } as Enquiry;
};

export const createEnquiryController = async (req: Request<never, never, EnquiryIntake>, res: Response) => {
  // TODO: Remove when create PUT calls get switched to POST
  if (req.body === undefined) req.body = { contacts: [] };
  const enquiry = await generateEnquiryData(req, IntakeStatus.SUBMITTED);

  // Create or update contacts
  if (req.body.contacts) await upsertContacts(req.body.contacts, req.currentContext, enquiry.activityId);

  // Create new enquiry
  const result = await createEnquiry({
    ...enquiry,
    assignedUserId: null,
    addedToAts: false,
    atsClientId: null,
    atsEnquiryId: null,
    waitingOn: null,
    submittedMethod: EnquirySubmittedMethod.PCNS,
    ...generateCreateStamps(req.currentContext),
    ...generateNullUpdateStamps()
  });

  res.status(201).json(result);
};

export const getEnquiriesController = async (req: Request, res: Response) => {
  // Pull from PCNS database
  let response = await getEnquiries();

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response = response.filter(
      (x) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
    );
  }

  res.status(200).json(response);
};

export const getEnquiryController = async (req: Request<{ enquiryId: string }>, res: Response) => {
  const response = await getEnquiry(req.params.enquiryId);
  res.status(200).json(response);
};

export const listRelatedEnquiriesController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await getRelatedEnquiries(req.params.activityId);
  res.status(200).json(response);
};

export const searchEnquiriesController = async (
  req: Request<never, never, never, EnquirySearchParameters>,
  res: Response
) => {
  let response = await searchEnquiries(
    {
      ...req.query,
      includeDeleted: isTruthy(req.query.includeDeleted),
      includeUser: isTruthy(req.query.includeUser)
    },
    req.currentContext.initiative as Initiative
  );

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter(
      (x) => x.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
    );
  }

  res.status(200).json(response);
};

export const updateEnquiryController = async (req: Request<never, never, Enquiry>, res: Response) => {
  const result = await updateEnquiry({
    ...req.body,
    ...generateUpdateStamps(req.currentContext)
  });

  res.status(200).json(result);
};

export const updateEnquiryIsDeletedFlagController = async (
  req: Request<{ enquiryId: string }, never, { isDeleted: boolean }>,
  res: Response
) => {
  const response = await updateEnquiryIsDeletedFlag(
    req.params.enquiryId,
    req.body.isDeleted,
    generateUpdateStamps(req.currentContext)
  );

  res.status(200).json(response);
};
