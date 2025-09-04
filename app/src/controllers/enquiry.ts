import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import {
  generateCreateStamps,
  generateDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps
} from '../db/utils/utils';
import { createActivity, deleteActivity } from '../services/activity';
import { upsertContacts } from '../services/contact';
import {
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  getEnquiry,
  getRelatedEnquiries,
  searchEnquiries,
  updateEnquiry
} from '../services/enquiry';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, EnquirySubmittedMethod, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { getCurrentUsername, isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { CurrentContext, Enquiry, EnquiryIntake, EnquirySearchParameters } from '../types';

const generateEnquiryData = async (
  tx: PrismaTransactionClient,
  data: EnquiryIntake,
  currentContext: CurrentContext
) => {
  const activityId =
    data.activityId ??
    (await createActivity(tx, currentContext.initiative as Initiative, generateCreateStamps(currentContext)))
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
    submittedBy: getCurrentUsername(currentContext),
    intakeStatus: IntakeStatus.SUBMITTED,
    enquiryStatus: data.enquiryStatus ?? ApplicationStatus.NEW,
    submissionType: data?.basic?.submissionType ?? SubmissionType.GENERAL_ENQUIRY
  } as Enquiry;
};

export const createEnquiryController = async (req: Request<never, never, EnquiryIntake>, res: Response) => {
  // TODO: Remove when create PUT calls get switched to POST
  if (req.body === undefined) req.body = { contacts: [] };

  const result = await transactionWrapper<Enquiry>(async (tx: PrismaTransactionClient) => {
    const enquiry = await generateEnquiryData(tx, req.body, req.currentContext);

    // Create or update contacts
    if (req.body.contacts) await upsertContacts(tx, req.body.contacts);

    // Create new enquiry
    return await createEnquiry(tx, {
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
  });

  res.status(201).json(result);
};

export const deleteEnquiryController = async (req: Request<{ enquiryId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const enquiry = await getEnquiry(tx, req.params.enquiryId);
    await deleteEnquiry(tx, req.params.enquiryId, generateDeleteStamps(req.currentContext));
    await deleteActivity(tx, enquiry.activityId, generateDeleteStamps(req.currentContext));
  });
  res.status(204).end();
};

export const getEnquiriesController = async (req: Request, res: Response) => {
  // Pull from PCNS database
  let response = await transactionWrapper<Enquiry[]>(async (tx: PrismaTransactionClient) => {
    return await getEnquiries(tx);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response = response.filter(
      (x) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
    );
  }

  res.status(200).json(response);
};

export const getEnquiryController = async (req: Request<{ enquiryId: string }>, res: Response) => {
  const response = await transactionWrapper<Enquiry>(async (tx: PrismaTransactionClient) => {
    return await getEnquiry(tx, req.params.enquiryId);
  });
  res.status(200).json(response);
};

export const listRelatedEnquiriesController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await transactionWrapper<Enquiry[]>(async (tx: PrismaTransactionClient) => {
    return await getRelatedEnquiries(tx, req.params.activityId);
  });
  res.status(200).json(response);
};

export const searchEnquiriesController = async (
  req: Request<never, never, never, EnquirySearchParameters>,
  res: Response
) => {
  let response = await transactionWrapper<Enquiry[]>(async (tx: PrismaTransactionClient) => {
    return await searchEnquiries(
      tx,
      {
        ...req.query,
        includeUser: isTruthy(req.query.includeUser)
      },
      req.currentContext.initiative as Initiative
    );
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter(
      (x) => x.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
    );
  }

  res.status(200).json(response);
};

export const updateEnquiryController = async (req: Request<never, never, Enquiry>, res: Response) => {
  const result = await transactionWrapper<Enquiry>(async (tx: PrismaTransactionClient) => {
    return await updateEnquiry(tx, {
      ...req.body,
      ...generateUpdateStamps(req.currentContext)
    });
  });

  res.status(200).json(result);
};
