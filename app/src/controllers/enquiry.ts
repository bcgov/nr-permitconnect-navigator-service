import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  generateCreateStamps,
  generateDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps
} from '../db/utils/utils.ts';
import { createActivity, deleteActivity } from '../services/activity.ts';
import { createActivityContact, listActivityContacts } from '../services/activityContact.ts';
import { searchContacts, upsertContacts } from '../services/contact.ts';
import {
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  getEnquiry,
  getRelatedEnquiries,
  searchEnquiries,
  updateEnquiry
} from '../services/enquiry.ts';
import {
  ActivityContactRole,
  ApplicationStatus,
  EnquirySubmittedMethod,
  SubmissionType
} from '../utils/enums/projectCommon.ts';
import { getCurrentUsername, isTruthy } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Contact, CurrentContext, Enquiry, EnquiryIntake, EnquirySearchParameters } from '../types/index.ts';

const generateEnquiryData = async (
  tx: PrismaTransactionClient,
  data: EnquiryIntake,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required
  if (!activityId) {
    activityId = (await createActivity(tx, currentContext.initiative!, generateCreateStamps(currentContext)))
      ?.activityId;
    const contacts = await searchContacts(tx, { userId: [currentContext.userId!] });
    if (contacts[0]) await createActivityContact(tx, activityId, contacts[0].contactId, ActivityContactRole.PRIMARY);
  }

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
    activityId: activityId,
    submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
    submittedBy: getCurrentUsername(currentContext),
    enquiryStatus: data.enquiryStatus ?? ApplicationStatus.NEW,
    submissionType: data?.basic?.submissionType ?? SubmissionType.GENERAL_ENQUIRY
  } as Enquiry;
};

export const createEnquiryController = async (req: Request<never, never, EnquiryIntake>, res: Response) => {
  // Provide an empty body if POST body is given undefined
  req.body ??= {} as EnquiryIntake;

  const result = await transactionWrapper<Enquiry & { contact: Contact }>(async (tx: PrismaTransactionClient) => {
    const enquiry = await generateEnquiryData(tx, req.body, req.currentContext);

    // Create new enquiry
    const data = await createEnquiry(tx, {
      ...enquiry,
      assignedUserId: null,
      addedToAts: false,
      atsClientId: null,
      atsEnquiryId: null,
      submittedMethod: EnquirySubmittedMethod.PCNS,
      ...generateCreateStamps(req.currentContext),
      ...generateNullUpdateStamps()
    });

    // Update the contact
    const contactResponse = await upsertContacts(tx, [
      { ...req.body.contact, ...generateUpdateStamps(req.currentContext) }
    ]);

    // Create additional activity_contact links if the enquiry is related to a project
    if (data.relatedActivityId) {
      const currentContact = await searchContacts(tx, { userId: [req.currentContext.userId!] });

      const relatedContacts = (await listActivityContacts(tx, data.relatedActivityId)).filter(
        (x) => x.contactId != currentContact[0].contactId
      );

      await Promise.all(
        relatedContacts.map(
          async (x) => await createActivityContact(tx, data.activityId, x.contactId, ActivityContactRole.MEMBER)
        )
      );
    }

    return { ...data, contact: contactResponse[0] };
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
  const response = await transactionWrapper<Enquiry[]>(async (tx: PrismaTransactionClient) => {
    return await getEnquiries(tx);
  });
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
  const response = await transactionWrapper<Enquiry[]>(async (tx: PrismaTransactionClient) => {
    return await searchEnquiries(
      tx,
      {
        ...req.query,
        includeUser: isTruthy(req.query.includeUser)
      },
      req.currentContext.initiative!
    );
  });

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
