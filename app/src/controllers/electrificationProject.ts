import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import {
  activityService,
  contactService,
  draftService,
  emailService,
  electrificationProjectService
} from '../services';
import { Initiative } from '../utils/enums/application';
import { DraftCode, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type {
  CurrentContext,
  Draft,
  Email,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  StatisticsFilters
} from '../types';

const controller = {
  generateElectrificationProjectData: async (
    data: ElectrificationProjectIntake,
    intakeStatus: string,
    currentContext: CurrentContext
  ) => {
    const activityId =
      data.activityId ??
      (await activityService.createActivity(Initiative.ELECTRIFICATION, generateCreateStamps(currentContext)))
        ?.activityId;

    // Put new electrification project together
    const electrificationProjectData = {
      electrificationProject: {
        electrificationProjectId: uuidv4(),
        activityId: activityId,
        submittedAt: data.submittedAt ?? new Date().toISOString(),
        ...data,
        submissionType: SubmissionType.GUIDANCE
      } as ElectrificationProject
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
      const response = await electrificationProjectService.getElectrificationProjects();
      res.status(200).json(response.map((x) => x.activityId));
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
      const { electrificationProject } = await controller.generateElectrificationProjectData(
        req.body,
        IntakeStatus.SUBMITTED,
        req.currentContext
      );

      // Create contacts
      if (req.body.contacts)
        await contactService.upsertContacts(req.body.contacts, req.currentContext, electrificationProject.activityId);

      // Create new electrification project
      const result = await electrificationProjectService.createElectrificationProject({
        ...electrificationProject,
        ...generateCreateStamps(req.currentContext)
      });

      res
        .status(201)
        .json({ activityId: result.activityId, electrificationProjectId: result.electrificationProjectId });
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteElectrificationProject: async (
    req: Request<{ electrificationProjectId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await electrificationProjectService.deleteElectrificationProject(
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
      const response = await draftService.getDrafts(DraftCode.ELECTRIFICATION_PROJECT);
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
      const response = await electrificationProjectService.getElectrificationProjects();
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
      const response = await electrificationProjectService.searchElectrificationProjects({
        ...req.query,
        includeUser: isTruthy(req.query.includeUser),
        includeDeleted: isTruthy(req.query.includeDeleted)
      });

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  submitDraft: async (req: Request<never, never, ElectrificationProjectIntake>, res: Response, next: NextFunction) => {
    try {
      const { electrificationProject } = await controller.generateElectrificationProjectData(
        req.body,
        IntakeStatus.SUBMITTED,
        req.currentContext
      );

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
          await activityService.createActivity(Initiative.HOUSING, generateCreateStamps(req.currentContext))
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
    req: Request<never, never, ElectrificationProject>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // If Navigator created empty electrification project we need to assign contactIds on save
      req.body.contacts = req.body.contacts.map((x) => {
        if (!x.contactId) x.contactId = uuidv4();
        return x;
      });
      await contactService.upsertContacts(req.body.contacts, req.currentContext, req.body.activityId);

      const response = await electrificationProjectService.updateElectrificationProject({
        ...req.body,
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
