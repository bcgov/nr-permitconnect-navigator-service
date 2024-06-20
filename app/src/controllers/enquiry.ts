import { NIL, v4 as uuidv4 } from 'uuid';

import { activityService, enquiryService, noteService, userService } from '../services';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, IntakeStatus, NoteType, SubmissionType } from '../utils/enums/housing';
import { getCurrentIdentity, isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { Enquiry } from '../types';

const controller = {
  createRelatedNote: async (req: Request, data: Enquiry) => {
    if (data.relatedActivityId) {
      const activity = await activityService.getActivity(data.relatedActivityId);
      if (activity) {
        const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);

        await noteService.createNote({
          activityId: data.relatedActivityId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
          note: `Added by ${(req.currentUser?.tokenPayload as any)?.idir_username}\nEnquiry #${data.activityId}\n${data.enquiryDescription}`,
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

  generateEnquiryData: async (req: Request) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = req.body;

    const activityId = data.activityId ?? (await activityService.createActivity(Initiative.HOUSING))?.activityId;

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
      submittedBy: (req.currentUser?.tokenPayload as any)?.idir_username,
      intakeStatus: data.submit ? IntakeStatus.SUBMITTED : IntakeStatus.DRAFT,
      enquiryStatus: data.enquiryStatus ?? ApplicationStatus.NEW,
      enquiryType: data?.enquiryType ?? SubmissionType.GENERAL_ENQUIRY
    };
  },

  createDraft: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = req.body;

      const enquiry = await controller.generateEnquiryData(req);

      // Create new enquiry
      const result = await enquiryService.createEnquiry(enquiry);

      // On submit attempt to create note if enquiry is associated with an existing activity
      if (data.submit) {
        await controller.createRelatedNote(req, result);
      }

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

  getEnquiries: async (req: Request<never, { self?: string }>, res: Response, next: NextFunction) => {
    try {
      // Pull from PCNS database
      let response = await enquiryService.getEnquiries();

      if (isTruthy(req.query.self)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response = response.filter((x) => x?.submittedBy === (req.currentUser?.tokenPayload as any)?.idir_username);
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

  updateEnquiry: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = req.body;

      const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);
      const result = await enquiryService.updateEnquiry({
        ...data,
        updatedBy: userId
      } as Enquiry);

      res.status(200).json(result);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateDraft: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = req.body;

      const enquiry = await controller.generateEnquiryData(req);

      // Update enquiry
      const result = await enquiryService.updateEnquiry(enquiry as Enquiry);

      // On submit, attempt to create note if enquiry is associated with an existing activity
      if (data.submit) {
        await controller.createRelatedNote(req, result);
      }

      res.status(200).json({ activityId: result.activityId, enquiryId: result.enquiryId });
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
