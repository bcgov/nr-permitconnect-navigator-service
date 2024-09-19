import { NIL, v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { activityService, enquiryService, noteService, userService } from '../services';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, IntakeStatus, NoteType, SubmissionType } from '../utils/enums/housing';
import { getCurrentSubject, getCurrentUsername } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { Enquiry, EnquiryIntake } from '../types';

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

  generateEnquiryData: async (req: Request<never, never, EnquiryIntake>) => {
    const data = req.body;

    const activityId =
      data.activityId ??
      (await activityService.createActivity(Initiative.HOUSING, generateCreateStamps(req.currentContext)))?.activityId;

    let applicant, basic;

    // Create applicant information
    if (data.applicant) {
      applicant = {
        contactFirstName: data.applicant.contactFirstName,
        contactLastName: data.applicant.contactLastName,
        contactPhoneNumber: data.applicant.contactPhoneNumber,
        contactEmail: data.applicant.contactEmail,
        contactApplicantRelationship: data.applicant.contactApplicantRelationship,
        contactPreference: data.applicant.contactPreference
      };
    }

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
      ...applicant,
      ...basic,
      enquiryId: data.enquiryId ?? uuidv4(),
      activityId: activityId,
      submittedAt: data.submittedAt ?? new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      submittedBy: getCurrentUsername(req.currentContext),
      intakeStatus: data.submit ? IntakeStatus.SUBMITTED : IntakeStatus.DRAFT,
      enquiryStatus: data.enquiryStatus ?? ApplicationStatus.NEW,
      enquiryType: data?.basic?.enquiryType ?? SubmissionType.GENERAL_ENQUIRY
    };
  },

  createDraft: async (req: Request<never, never, EnquiryIntake>, res: Response, next: NextFunction) => {
    try {
      const enquiry = await controller.generateEnquiryData(req);

      // Create new enquiry
      const result = await enquiryService.createEnquiry({
        ...enquiry,
        ...generateCreateStamps(req.currentContext)
      });

      res.status(201).json({ activityId: result.activityId, enquiryId: result.enquiryId });
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteEnquiry: async (req: Request<{ enquiryId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await enquiryService.deleteEnquiry(req.params.enquiryId);
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
      const result = await enquiryService.updateEnquiry({
        ...req.body,
        ...generateUpdateStamps(req.currentContext)
      } as Enquiry);

      res.status(200).json(result);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateDraft: async (req: Request<never, never, EnquiryIntake>, res: Response, next: NextFunction) => {
    try {
      const enquiry = await controller.generateEnquiryData(req);

      // Update enquiry
      const result = await enquiryService.updateEnquiry({
        ...(enquiry as Enquiry),
        ...generateUpdateStamps(req.currentContext)
      });

      res.status(200).json({ activityId: result.activityId, enquiryId: result.enquiryId });
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
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
