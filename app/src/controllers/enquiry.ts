import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';

import { createActivity } from '../services/activity';
import { deleteUnmatchedActivityContacts, upsertActivityContacts } from '../services/activityContact';
import { insertContacts, upsertContacts } from '../services/contact';
import { createEnquiry, getEnquiries, getEnquiry, getRelatedEnquiries, searchEnquiries, updateEnquiry, updateIsDeletedFlag } from '../services/enquiry';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { getCurrentUsername, partition, isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type { Contact, Enquiry, EnquiryIntake, EnquirySearchParameters } from '../types';

const generateEnquiryData = async (req: Request<never, never, EnquiryIntake>, intakeStatus: string) => {
  const data = req.body;

  const activityId =
    data.activityId ??
    (
      await createActivity(
        req.currentContext.initiative as Initiative,
        generateCreateStamps(req.currentContext)
      )
    )?.activityId;

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
    submittedAt: data.submittedAt ?? new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submittedBy: getCurrentUsername(req.currentContext),
    intakeStatus: intakeStatus,
    enquiryStatus: data.enquiryStatus ?? ApplicationStatus.NEW,
    submissionType: data?.basic?.submissionType ?? SubmissionType.GENERAL_ENQUIRY
  };
};

export const createEnquiryController = async (
  req: Request<never, never, EnquiryIntake>,
  res: Response
) => {

    // TODO: Remove when create PUT calls get switched to POST
    if (req.body === undefined) req.body = { contacts: [] };
    const enquiry = await generateEnquiryData(req, IntakeStatus.SUBMITTED);

    // Create or update contacts
    if (req.body.contacts) await upsertContacts(req.body.contacts, req.currentContext, enquiry.activityId);

    // Create new enquiry
    const result = await createEnquiry({
      ...enquiry,
      ...generateCreateStamps(req.currentContext)
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

export const listRelatedEnquiriesController = async (
  req: Request<{ activityId: string }>,
  res: Response
) => {
    const response = await getRelatedEnquiries(req.params.activityId);
    res.status(200).json(response);
};

export const searchEnquiriesController = async (
  req: Request<never, never, never, EnquirySearchParameters>,
  res: Response,
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

export const updateEnquiryController = async (
  req: Request<never, never, Enquiry>,
  res: Response
) => {
  try {
    if (req.body.contacts) {
      // Predicate function to check if a contact has a contactId.
      // Used to partition contacts into existing (with contactId) and new (without contactId).
      const hasContactId = (x: Contact) => !!x.contactId;

      // Partition contacts into exisiting and new based on whether they have a contactId
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
      await deleteUnmatchedActivityContacts(req.body.activityId, contacts);

      // Create or update activity_contact with the data from the request
      await upsertActivityContacts(req.body.activityId, contacts);
    }

    const result = await updateEnquiry({
      ...req.body,
      ...generateUpdateStamps(req.currentContext)
    } as Enquiry);

    if (!result) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.status(200).json(result);

};

export const updateIsDeletedFlagController = async (
  req: Request<{ enquiryId: string }, never, { isDeleted: boolean }>,
  res: Response
) => {
  const response = await updateIsDeletedFlag(
    req.params.enquiryId,
    req.body.isDeleted,
    generateUpdateStamps(req.currentContext)
  );

  if (!response) {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  res.status(200).json(response);
};
