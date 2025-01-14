import { NIL, v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils.ts';
import { activityService, contactService, enquiryService, noteService, userService } from '../services/index.ts';
import { Initiative } from '../utils/enums/application.ts';
import { ApplicationStatus, IntakeStatus, NoteType, SubmissionType } from '../utils/enums/housing.ts';
import { getCurrentSubject, getCurrentUsername } from '../utils/utils.ts';

import type { NextFunction, Request, Response } from 'express';
import type { Enquiry, EnquiryIntake } from '../types/index.ts';

const controller = {
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
      (await activityService.createActivity(Initiative.HOUSING, generateCreateStamps(req.currentContext)))?.activityId;

    let basic;

    if (data.basic) {
      basic = {
        enquiryType: data.basic.enquiryType,
        isRelated: data.basic.isRelated,
        relatedActivityId: data.basic.relatedActivityId,
        enquiryDescription: data.basic.enquiryDescription,
        applyForPermitConnect: data.basic.applyForPermitConnect
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
      enquiryType: data?.basic?.enquiryType ?? SubmissionType.GENERAL_ENQUIRY
    };
  },

  createEnquiry: async (req: Request<never, never, EnquiryIntake>, res: Response, next: NextFunction) => {
    try {
      const enquiry = await controller.generateEnquiryData(req, IntakeStatus.SUBMITTED);

      // Create or update contacts
      await contactService.upsertContacts(enquiry.activityId, req.body.contacts, req.currentContext);

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
        response = response.filter((x) => x?.submittedBy === getCurrentUsername(req.currentContext));
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

  updateEnquiry: async (req: Request<never, never, Enquiry>, res: Response, next: NextFunction) => {
    try {
      await contactService.upsertContacts(req.body.activityId, req.body.contacts, req.currentContext);

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
