import { NIL, v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import {
  activityService,
  activityContactService,
  contactService,
  enquiryService,
  noteService,
  userService
} from '../services';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, IntakeStatus, NoteType, SubmissionType } from '../utils/enums/projectCommon';
import { getCurrentSubject, getCurrentUsername, isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { Enquiry, EnquiryIntake, EnquirySearchParameters } from '../types';

const controller = {
  /**
   * @deprecated Not used anywhere
   */
  createRelatedNote: async (req: Request, data: Enquiry) => {
    if (data.relatedActivityId) {
      const activity = await activityService.getActivity(data.relatedActivityId);
      if (activity) {
        const userId = await userService.getCurrentUserId(getCurrentSubject(req.currentContext), NIL);

        await noteService.createNote({
          activityId: data.relatedActivityId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
          note: `Added by ${getCurrentUsername(req.currentContext)}\nEnquiry #${data.activityId}\n${data.enquiryDescription}`,
          noteType: NoteType.ENQUIRY,
          title: 'Enquiry',
          bringForwardDate: null,
          bringForwardState: null,
          createdAt: new Date().toISOString(),
          createdBy: userId,
          isDeleted: false
        });
      }
    }
  },

  generateEnquiryData: async (req: Request<never, never, EnquiryIntake>, intakeStatus: string) => {
    const data = req.body;

    const activityId =
      data.activityId ??
      (
        await activityService.createActivity(
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
  },

  createEnquiry: async (req: Request<never, never, EnquiryIntake>, res: Response, next: NextFunction) => {
    try {
      // TODO: Remove when create PUT calls get switched to POST
      if (req.body === undefined) req.body = { contacts: [] };
      const enquiry = await controller.generateEnquiryData(req, IntakeStatus.SUBMITTED);

      // Create or update contacts
      if (req.body.contacts)
        await contactService.upsertContacts(req.body.contacts, req.currentContext, enquiry.activityId);

      // Create new enquiry
      const result = await enquiryService.createEnquiry({
        ...enquiry,
        ...generateCreateStamps(req.currentContext)
      });

      res.status(201).json(result);
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteEnquiry: async (req: Request<{ enquiryId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await enquiryService.deleteEnquiry(req.params.enquiryId);

      if (!response) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getEnquiries: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Pull from PCNS database
      let response = await enquiryService.getEnquiries();

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response = response.filter(
          (x) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
        );
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getEnquiry: async (req: Request<{ enquiryId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await enquiryService.getEnquiry(req.params.enquiryId);

      if (!response) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  listRelatedEnquiries: async (req: Request<{ activityId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await enquiryService.getRelatedEnquiries(req.params.activityId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchEnquiries: async (
    req: Request<never, never, never, EnquirySearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let response = await enquiryService.searchEnquiries(
        {
          ...req.query,
          includeDeleted: isTruthy(req.query.includeDeleted),
          includeUser: isTruthy(req.query.includeUser)
        },
        req.currentContext.initiative as Initiative
      );

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter(
          (x: Enquiry) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
        );
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateEnquiry: async (req: Request<never, never, Enquiry>, res: Response, next: NextFunction) => {
    try {
      if (req.body.contacts) {
        // Filter out contacts with contactId and assign contactId for the new contacts
        const newContacts = req.body.contacts
          .filter((x) => !x.contactId)
          .map((x) => ({
            ...x,
            contactId: x.contactId ?? uuidv4()
          }));
        // Insert new contacts into the contact table
        await contactService.insertContacts(newContacts, req.currentContext);
        // Remove the contacts without contactId and add newContacts to request
        req.body.contacts = req.body.contacts.filter((x) => x.contactId).concat(newContacts);
        // Delete any activity_contact records that doesn't match the activity and contacts in the request
        await activityContactService.deleteUnmatchedActivityContacts(req.body.activityId, req.body.contacts);
        // Create or update activity_contact with the data from the request
        await activityContactService.upsertActivityContacts(req.body.activityId, req.body.contacts);
      }

      const result = await enquiryService.updateEnquiry({
        ...req.body,
        ...generateUpdateStamps(req.currentContext)
      } as Enquiry);

      if (!result) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }

      res.status(200).json(result);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateIsDeletedFlag: async (
    req: Request<{ enquiryId: string }, never, { isDeleted: boolean }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await enquiryService.updateIsDeletedFlag(
        req.params.enquiryId,
        req.body.isDeleted,
        generateUpdateStamps(req.currentContext)
      );

      if (!response) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
