import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import {
  activityService,
  contactService,
  draftService,
  emailService,
  enquiryService,
  housingProjectService,
  permitService
} from '../services';
import { Initiative } from '../utils/enums/application';
import { NumResidentialUnits } from '../utils/enums/housing';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '../utils/enums/permit';
import { ApplicationStatus, DraftCode, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { getCurrentUsername, isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type {
  CurrentContext,
  Draft,
  Email,
  HousingProject,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  Permit,
  StatisticsFilters
} from '../types';

const controller = {
  /**
   * @function assignPriority
   * Assigns a priority level to a housing project based on given criteria
   * Criteria defined below
   */
  assignPriority: (housingProject: Partial<HousingProject>) => {
    const matchesPriorityOneCriteria = // Priority 1 Criteria:
      // 1. More than 50 units (any)
      housingProject.singleFamilyUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
      housingProject.singleFamilyUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
      housingProject.multiFamilyUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
      housingProject.multiFamilyUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
      housingProject.otherUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
      housingProject.otherUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
      // 2. Supports Rental Units
      housingProject.hasRentalUnits === 'Yes' ||
      // 3. Social Housing
      housingProject.financiallySupportedBC === 'Yes' ||
      // 4. Indigenous Led
      housingProject.financiallySupportedIndigenous === 'Yes';

    const matchesPriorityTwoCriteria = // Priority 2 Criteria:
      // 1. Single Family >= 10 Units
      housingProject.singleFamilyUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE ||
      // 2. Has 1 or more MultiFamily Units
      housingProject.multiFamilyUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE ||
      housingProject.multiFamilyUnits === NumResidentialUnits.ONE_TO_NINE ||
      // 3. Has 1 or more Other Units
      housingProject.otherUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE ||
      housingProject.otherUnits === NumResidentialUnits.ONE_TO_NINE;

    if (matchesPriorityOneCriteria) {
      housingProject.queuePriority = 1;
    } else if (matchesPriorityTwoCriteria) {
      housingProject.queuePriority = 2;
    } else {
      // Prioriy 3 Criteria:
      housingProject.queuePriority = 3; // Everything Else
    }
  },

  generateHousingProjectData: async (data: HousingProjectIntake, currentContext: CurrentContext) => {
    const activityId =
      data.activityId ??
      (await activityService.createActivity(Initiative.HOUSING, generateCreateStamps(currentContext)))?.activityId;

    let basic, housing, location, permits;
    let appliedPermits: Array<Permit> = [],
      investigatePermits: Array<Permit> = [];

    if (data.basic) {
      basic = {
        consentToFeedback: data.basic.consentToFeedback ?? false,
        projectApplicantType: data.basic.projectApplicantType,
        isDevelopedInBC: data.basic.isDevelopedInBC,
        companyNameRegistered: data.basic.registeredName
      };
    }

    if (data.housing) {
      housing = {
        projectName: data.housing.projectName,
        projectDescription: data.housing.projectDescription,
        singleFamilyUnits: data.housing.singleFamilyUnits,
        multiFamilyUnits: data.housing.multiFamilyUnits,
        otherUnitsDescription: data.housing.otherUnitsDescription,
        otherUnits: data.housing.otherUnits,
        hasRentalUnits: data.housing.hasRentalUnits,
        financiallySupportedBC: data.housing.financiallySupportedBC,
        financiallySupportedIndigenous: data.housing.financiallySupportedIndigenous,
        financiallySupportedNonProfit: data.housing.financiallySupportedNonProfit,
        financiallySupportedHousingCoop: data.housing.financiallySupportedHousingCoop,
        rentalUnits: data.housing.rentalUnits,
        indigenousDescription: data.housing.indigenousDescription,
        nonProfitDescription: data.housing.nonProfitDescription,
        housingCoopDescription: data.housing.housingCoopDescription
      };
    }

    if (data.location) {
      location = {
        naturalDisaster: data.location.naturalDisaster,
        projectLocation: data.location.projectLocation,
        projectLocationDescription: data.location.projectLocationDescription,
        geoJSON: data.location.geoJSON,
        locationPIDs: data.location.ltsaPIDLookup,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        streetAddress: data.location.streetAddress,
        locality: data.location.locality,
        province: data.location.province
      };
    }

    if (data.permits) {
      permits = {
        hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
      };
    }

    if (data.appliedPermits && data.appliedPermits.length) {
      appliedPermits = data.appliedPermits.map((x: Permit) => ({
        permitId: x.permitId,
        permitTypeId: x.permitTypeId,
        activityId: activityId as string,
        trackingId: x.trackingId,
        status: PermitStatus.APPLIED,
        needed: PermitNeeded.YES,
        statusLastVerified: null,
        issuedPermitId: null,
        authStatus: PermitAuthorizationStatus.IN_REVIEW,
        submittedDate: x.submittedDate,
        adjudicationDate: null,
        permitType: null
      }));
    }

    if (data.investigatePermits && data.investigatePermits.length) {
      investigatePermits = data.investigatePermits.map((x: Permit) => ({
        permitId: x.permitId as string,
        permitTypeId: x.permitTypeId as number,
        activityId: activityId as string,
        trackingId: null,
        status: PermitStatus.NEW,
        needed: PermitNeeded.UNDER_INVESTIGATION,
        statusLastVerified: null,
        issuedPermitId: null,
        authStatus: PermitAuthorizationStatus.NONE,
        submittedDate: null,
        adjudicationDate: null,
        permitType: null
      }));
    }

    // Put new housing project together
    const housingProjectData = {
      housingProject: {
        ...basic,
        ...housing,
        ...location,
        ...permits,
        housingProjectId: uuidv4(),
        activityId: activityId,
        submittedAt: data.submittedAt ?? new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submittedBy: getCurrentUsername(currentContext),
        intakeStatus: IntakeStatus.SUBMITTED,
        applicationStatus: data.applicationStatus ?? ApplicationStatus.NEW,
        submissionType: data?.submissionType ?? SubmissionType.GUIDANCE
      } as HousingProject,
      appliedPermits,
      investigatePermits
    };

    controller.assignPriority(housingProjectData.housingProject);

    return housingProjectData;
  },

  /**
   * @function emailConfirmation
   * Send an email with the confirmation of housing project
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
      let response = await housingProjectService.getHousingProjects();
      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter(
          (x: HousingProject) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
        );
      }
      res.status(200).json(response.map((x: HousingProject) => x.activityId));
    } catch (e: unknown) {
      next(e);
    }
  },

  createHousingProject: async (req: Request<never, never, HousingProjectIntake>, res: Response, next: NextFunction) => {
    try {
      // TODO: Remove when create PUT calls get switched to POST
      if (req.body === undefined) req.body = {};
      const { housingProject, appliedPermits, investigatePermits } = await controller.generateHousingProjectData(
        req.body,
        req.currentContext
      );

      // Create contacts
      if (req.body.contacts)
        await contactService.upsertContacts(req.body.contacts, req.currentContext, housingProject.activityId);

      // Create new housing project
      const result = await housingProjectService.createHousingProject({
        ...housingProject,
        ...generateCreateStamps(req.currentContext)
      });

      // Create each permit
      await Promise.all(appliedPermits.map(async (x: Permit) => await permitService.createPermit(x)));
      await Promise.all(investigatePermits.map(async (x: Permit) => await permitService.createPermit(x)));

      res.status(201).json({ activityId: result.activityId, housingProjectId: result.housingProjectId });
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteHousingProject: async (req: Request<{ housingProjectId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await housingProjectService.deleteHousingProject(req.params.housingProjectId);

      if (!response) {
        return res.status(404).json({ message: 'Housing Project not found' });
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
        return res.status(404).json({ message: 'Housing Project draft not found' });
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
      let response = await draftService.getDrafts(DraftCode.HOUSING_PROJECT);

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
      const response = await housingProjectService.getStatistics(req.query);
      res.status(200).json(response[0]);
    } catch (e: unknown) {
      next(e);
    }
  },

  getHousingProject: async (req: Request<{ housingProjectId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await housingProjectService.getHousingProject(req.params.housingProjectId);

      if (!response) {
        return res.status(404).json({ message: 'Housing Project not found' });
      }

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        if (response?.submittedBy.toUpperCase() !== getCurrentUsername(req.currentContext)?.toUpperCase()) {
          res.status(403).send();
        }
      }

      if (response?.activityId) {
        const relatedEnquiries = await enquiryService.getRelatedEnquiries(response.activityId);
        if (relatedEnquiries.length) response.relatedEnquiries = relatedEnquiries.map((x) => x.activityId).join(', ');
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getHousingProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let response = await housingProjectService.getHousingProjects();

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter(
          (x: HousingProject) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
        );
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchHousingProjects: async (
    req: Request<never, never, never, HousingProjectSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let response = await housingProjectService.searchHousingProjects({
        ...req.query,
        includeUser: isTruthy(req.query.includeUser),
        includeDeleted: isTruthy(req.query.includeDeleted)
      });

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter(
          (x: HousingProject) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
        );
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  submitDraft: async (req: Request<never, never, HousingProjectIntake>, res: Response, next: NextFunction) => {
    try {
      const { housingProject, appliedPermits, investigatePermits } = await controller.generateHousingProjectData(
        req.body,
        req.currentContext
      );

      // Create contacts
      if (req.body.contacts)
        await contactService.upsertContacts(req.body.contacts, req.currentContext, housingProject.activityId);

      // Create new housing project
      const result = await housingProjectService.createHousingProject({
        ...housingProject,
        ...generateCreateStamps(req.currentContext)
      });

      // Create each permit
      await Promise.all(appliedPermits.map((x: Permit) => permitService.createPermit(x)));
      await Promise.all(investigatePermits.map((x: Permit) => permitService.createPermit(x)));

      // Delete old draft
      if (req.body.draftId) await draftService.deleteDraft(req.body.draftId);

      res.status(201).json({ activityId: result.activityId, housingProjectId: result.housingProjectId });
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
          draftCode: DraftCode.HOUSING_PROJECT,
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
    req: Request<{ housingProjectId: string }, never, { isDeleted: boolean }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await housingProjectService.updateIsDeletedFlag(
        req.params.housingProjectId,
        req.body.isDeleted,
        generateUpdateStamps(req.currentContext)
      );

      if (!response) {
        return res.status(404).json({ message: 'Housing Project not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateHousingProject: async (req: Request<never, never, HousingProject>, res: Response, next: NextFunction) => {
    try {
      // If Navigator created empty housing project we need to assign contactIds on save
      req.body.contacts = req.body.contacts.map((x) => {
        if (!x.contactId) x.contactId = uuidv4();
        return x;
      });
      await contactService.upsertContacts(req.body.contacts, req.currentContext, req.body.activityId);

      const response = await housingProjectService.updateHousingProject({
        ...req.body,
        ...generateUpdateStamps(req.currentContext)
      });

      if (!response) {
        return res.status(404).json({ message: 'Housing Project not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
