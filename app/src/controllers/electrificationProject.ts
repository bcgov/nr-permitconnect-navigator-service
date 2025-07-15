import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import {
  activityContactService,
  activityService,
  contactService,
  draftService,
  electrificationProjectService,
  emailService
} from '../services';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus, DraftCode, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { partition, isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type {
  Activity,
  Contact,
  CurrentContext,
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  Email,
  StatisticsFilters
} from '../types';

const controller = {
  /**
   * @function generateElectrificationProjectData
   * Handles creating a project from intake data
   */
  generateElectrificationProjectData: async (data: ElectrificationProjectIntake, currentContext: CurrentContext) => {
    const activityId =
      data.project.activityId ??
      (await activityService.createActivity(Initiative.ELECTRIFICATION, generateCreateStamps(currentContext)))
        ?.activityId;

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
  },

  /**
   * @function emailConfirmation
   * Send an email with the confirmation of electrification project
   */
  emailConfirmation: async (req: Request<never, never, Email>, res: Response, next: NextFunction) => {
    try {
      const { data, status } = await emailService.email(req.body);
      res.status(status).json(data);
    } catch (e: unknown) {
      next(e);
    }
  },

  getActivityIds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let response = await electrificationProjectService.getElectrificationProjects();

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter((x) => x?.createdBy === req.currentContext.userId);
      }

      res.status(200).json(response.map((x: ElectrificationProject) => x.activityId));
    } catch (e: unknown) {
      next(e);
    }
  },

  createElectrificationProject: async (
    req: Request<never, never, ElectrificationProjectIntake>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // TODO: Remove when create PUT calls get switched to POST
      if (req.body === undefined) {
        req.body = { project: {} };
      }
      const electrificationProject = await controller.generateElectrificationProjectData(req.body, req.currentContext);

      // Create contacts
      if (req.body.contacts)
        await contactService.upsertContacts(req.body.contacts, req.currentContext, electrificationProject.activityId);

      // Create new electrification project
      const result = await electrificationProjectService.createElectrificationProject({
        ...electrificationProject,
        ...generateCreateStamps(req.currentContext)
      });

      res.status(201).json(result);
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteDraft: async (req: Request<{ draftId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await draftService.deleteDraft(req.params.draftId);

      if (!response) {
        return res.status(404).json({ message: 'Electrification Project draft not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getDraft: async (req: Request<{ draftId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await draftService.getDraft(req.params.draftId);

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getDrafts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let response = await draftService.getDrafts(DraftCode.ELECTRIFICATION_PROJECT);

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter((x: Draft) => x?.createdBy === req.currentContext.userId);
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getStatistics: async (req: Request<never, never, never, StatisticsFilters>, res: Response, next: NextFunction) => {
    try {
      const response = await electrificationProjectService.getStatistics(req.query);
      res.status(200).json(response[0]);
    } catch (e: unknown) {
      next(e);
    }
  },

  getElectrificationProject: async (
    req: Request<{ electrificationProjectId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await electrificationProjectService.getElectrificationProject(
        req.params.electrificationProjectId
      );

      if (!response) {
        return res.status(404).json({ message: 'Electrification Project not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getElectrificationProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let response = await electrificationProjectService.getElectrificationProjects();

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter((x: ElectrificationProject) => x?.createdBy === req.currentContext.userId);
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchElectrificationProjects: async (
    req: Request<never, never, never, ElectrificationProjectSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let response = await electrificationProjectService.searchElectrificationProjects({
        ...req.query,
        includeUser: isTruthy(req.query.includeUser),
        includeDeleted: isTruthy(req.query.includeDeleted)
      });

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter((x: ElectrificationProject) => x?.createdBy === req.currentContext.userId);
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  submitDraft: async (req: Request<never, never, ElectrificationProjectIntake>, res: Response, next: NextFunction) => {
    try {
      const electrificationProject = await controller.generateElectrificationProjectData(req.body, req.currentContext);

      // Create contacts
      if (req.body.contacts)
        await contactService.upsertContacts(req.body.contacts, req.currentContext, electrificationProject.activityId);

      // Create new electrification project
      const result = await electrificationProjectService.createElectrificationProject({
        ...electrificationProject,
        ...generateCreateStamps(req.currentContext)
      });

      // Delete old draft
      if (req.body.draftId) await draftService.deleteDraft(req.body.draftId);

      res
        .status(201)
        .json({ activityId: result.activityId, electrificationProjectId: result.electrificationProjectId });
    } catch (e: unknown) {
      next(e);
    }
  },

  updateDraft: async (req: Request<never, never, Draft>, res: Response, next: NextFunction) => {
    try {
      const update = req.body.draftId && req.body.activityId;

      let response;

      if (update) {
        // Update draft
        response = await draftService.updateDraft({
          ...req.body,
          ...generateUpdateStamps(req.currentContext)
        });
      } else {
        const activityId = (
          await activityService.createActivity(Initiative.ELECTRIFICATION, generateCreateStamps(req.currentContext))
        )?.activityId;

        // Create new draft
        response = await draftService.createDraft({
          draftId: uuidv4(),
          activityId: activityId,
          draftCode: DraftCode.ELECTRIFICATION_PROJECT,
          data: req.body.data,
          ...generateCreateStamps(req.currentContext)
        });
      }

      res.status(update ? 200 : 201).json({ draftId: response?.draftId, activityId: response?.activityId });
    } catch (e: unknown) {
      next(e);
    }
  },

  updateIsDeletedFlag: async (
    req: Request<{ electrificationProjectId: string }, never, { isDeleted: boolean }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await electrificationProjectService.updateIsDeletedFlag(
        req.params.electrificationProjectId,
        req.body.isDeleted,
        generateUpdateStamps(req.currentContext)
      );

      if (!response) {
        return res.status(404).json({ message: 'Electrification Project not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateElectrificationProject: async (
    req: Request<never, never, { project: ElectrificationProject; contacts: Array<Contact> }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
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
        await contactService.insertContacts(newContacts, req.currentContext);

        // Delete any activity_contact records that doesn't match the activity and contacts in the request
        await activityContactService.deleteUnmatchedActivityContacts(req.body.project.activityId, contacts);

        // Create or update activity_contact with the data from the request
        await activityContactService.upsertActivityContacts(req.body.project.activityId, contacts);
      }

      const response = await electrificationProjectService.updateElectrificationProject({
        ...req.body.project,
        ...generateUpdateStamps(req.currentContext)
      });

      if (!response) {
        return res.status(404).json({ message: 'Electrification Project not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
