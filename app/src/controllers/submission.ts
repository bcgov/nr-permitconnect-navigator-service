import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { activityService, emailService, enquiryService, submissionService, permitService } from '../services';
import { BasicResponse, Initiative } from '../utils/enums/application';
import {
  ApplicationStatus,
  IntakeStatus,
  NumResidentialUnits,
  PermitNeeded,
  PermitStatus,
  ProjectLocation,
  SubmissionType
} from '../utils/enums/housing';
import { camelCaseToTitleCase, deDupeUnsure, getCurrentUsername, isTruthy, toTitleCase } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type {
  ChefsFormConfig,
  ChefsFormConfigData,
  Submission,
  ChefsSubmissionExport,
  Permit,
  Email,
  StatisticsFilters,
  SubmissionIntake,
  SubmissionSearchParameters
} from '../types';

const controller = {
  checkAndStoreNewSubmissions: async () => {
    const cfg = config.get('server.chefs.forms') as ChefsFormConfig;

    // Mapping of SHAS intake permit names to PCNS types
    const shasPermitMapping = new Map<string, string>([
      ['archaeologySiteAlterationPermit', 'Alteration'],
      ['archaeologyHeritageInspectionPermit', 'Inspection'],
      ['archaeologyInvestigationPermit', 'Investigation'],
      ['forestsPrivateTimberMark', 'Private Timber Mark'],
      ['forestsOccupantLicenceToCut', 'Occupant Licence To Cut'],
      ['landsCrownLandTenure', 'Commercial General'],
      ['roadwaysHighwayUsePermit', 'Highway Use Permit'],
      ['siteRemediation', 'Contaminated Sites Remediation'],
      ['subdividingLandOutsideAMunicipality', 'Rural Subdivision'],
      ['waterChangeApprovalForWorkInAndAboutAStream', 'Change Approval for Work in and About a Stream'],
      ['waterLicence', 'Water Licence'],
      ['waterNotificationOfAuthorizedChangesInAndAboutAStream', 'Notification'],
      ['waterShortTermUseApproval', 'Use Approval'],
      ['waterRiparianAreasProtection', 'New'],
      ['waterRiparianAreasProtection', 'New']
    ]);

    const permitTypes = await permitService.getPermitTypes();

    const exportData: Array<Partial<Submission & { activityId: string; formId: string; permits: Array<Permit> }>> =
      await Promise.all(
        Object.values<ChefsFormConfigData>(cfg).map(async (x: ChefsFormConfigData) => {
          return (await submissionService.getFormExport(x.id)).map((data: ChefsSubmissionExport) => {
            const financiallySupportedValues = {
              financiallySupportedBC: data.isBCHousingSupported
                ? toTitleCase(data.isBCHousingSupported)
                : BasicResponse.NO,
              financiallySupportedIndigenous: data.isIndigenousHousingProviderSupported
                ? toTitleCase(data.isIndigenousHousingProviderSupported)
                : BasicResponse.NO,
              financiallySupportedNonProfit: data.isNonProfitSupported
                ? toTitleCase(data.isNonProfitSupported)
                : BasicResponse.NO,
              financiallySupportedHousingCoop: data.isHousingCooperativeSupported
                ? toTitleCase(data.isHousingCooperativeSupported)
                : BasicResponse.NO
            };

            // Get unit counts ready for parsing - single, multi and other
            const unitData = [data.singleFamilyUnits, data.multiFamilyUnits, data.multiFamilyUnits1, data.rentalUnits];
            // Replace text instances with symbols
            const parsedUnitData = unitData.map((element) => {
              if (typeof element === 'string') {
                return element?.replace('greaterthan', '>');
              } else {
                return element;
              }
            });

            // Attempt to create Permits defined in SHAS intake form
            // permitGrid/previousTrackingNumber2 is current intake version as of 2024-02-01
            // dataGrid/previousTrackingNumber is previous intake version
            // not attempting to go back further than that
            const permitGrid = data.permitGrid ?? data.dataGrid ?? null;
            let permits: Array<Permit> = [];
            if (permitGrid) {
              permits = permitGrid
                .map(
                  (x: {
                    previousPermitType: string;
                    previousTrackingNumber2: string;
                    previousTrackingNumber: string;
                    status: string;
                    statusLastVerified: string;
                  }) => {
                    const permit = permitTypes.find((y) => y.type === shasPermitMapping.get(x.previousPermitType));
                    if (permit) {
                      return {
                        permitId: uuidv4(),
                        permitTypeId: permit.permitTypeId,
                        status: x.status,
                        statusLastVerified: x.statusLastVerified,
                        activityId: data.form.confirmationId,
                        trackingId: x.previousTrackingNumber2 ?? x.previousTrackingNumber
                      };
                    }
                  }
                )
                .filter((x: unknown) => !!x);
            }

            return {
              formId: x.id,
              submissionId: data.form.submissionId,
              activityId: data.form.confirmationId,
              applicationStatus: ApplicationStatus.NEW,
              companyNameRegistered: data.companyNameRegistered ?? data.companyName,
              contactEmail: data.contactEmail,
              contactPreference: camelCaseToTitleCase(data.contactPreference),
              projectName: data.projectName,
              projectDescription: data.projectDescription,
              contactPhoneNumber: data.contactPhoneNumber,
              contactFirstName: data.contactFirstName,
              contactLastName: data.contactLastName,
              contactApplicantRelationship: camelCaseToTitleCase(data.contactApplicantRelationship),
              financiallySupported: Object.values(financiallySupportedValues).includes(BasicResponse.YES),
              ...financiallySupportedValues,
              housingCoopDescription: data.housingCoopName,
              intakeStatus: toTitleCase(data.form.status),
              indigenousDescription: data.IndigenousHousingProviderName,
              isDevelopedByCompanyOrOrg: toTitleCase(data.isCompany),
              isDevelopedInBC: toTitleCase(data.isCompanyRegistered),
              locationPIDs: data.parcelID,
              latitude: data.latitude,
              locality: data.locality,
              longitude: data.longitude,
              multiFamilyUnits: parsedUnitData[1],
              naturalDisaster: data.naturalDisasterInd ? BasicResponse.YES : BasicResponse.NO,
              nonProfitDescription: data.nonProfitHousingSocietyName,
              otherUnitsDescription: data.otherProjectType,
              otherUnits: parsedUnitData[2],
              province: data.province,
              queuePriority: parseInt(data.queuePriority),
              singleFamilyUnits: parsedUnitData[0],
              hasRentalUnits: data.isRentalUnit
                ? camelCaseToTitleCase(deDupeUnsure(data.isRentalUnit))
                : BasicResponse.UNSURE,
              rentalUnits: parsedUnitData[3],
              projectLocation:
                data.addressType === 'civicAddress'
                  ? ProjectLocation.STREET_ADDRESS
                  : ProjectLocation.LOCATION_COORDINATES,
              streetAddress: data.streetAddress,
              submittedAt: data.form.createdAt,
              submittedBy: data.form.username,
              hasAppliedProvincialPermits: toTitleCase(data.previousPermits),
              permits: permits
            };
          });
        })
      ).then((x) => x.filter((y) => y.length).flat());

    // Get a list of all activity IDs currently in our DB
    const stored: Array<string> = (await submissionService.getSubmissions()).map((x: Submission) => x.activityId);

    // Filter to entries not in our DB and create
    const notStored = exportData.filter((x) => !stored.some((activityId: string) => activityId === x.activityId));
    await submissionService.createSubmissionsFromExport(notStored);

    // Create each permit
    notStored.map((x) => x.permits?.map(async (y) => await permitService.createPermit(y)));
  },

  generateSubmissionData: async (req: Request<never, never, SubmissionIntake>, intakeStatus: string) => {
    const data = req.body;

    const activityId =
      data.activityId ??
      (await activityService.createActivity(Initiative.HOUSING, generateCreateStamps(req.currentContext)))?.activityId;

    let applicant, basic, housing, location, permits;
    let appliedPermits: Array<Permit> = [],
      investigatePermits: Array<Permit> = [];

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
        consentToFeedback: data.basic.consentToFeedback ?? false,
        isDevelopedByCompanyOrOrg: data.basic.isDevelopedByCompanyOrOrg,
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
        needed: null,
        statusLastVerified: x.statusLastVerified,
        issuedPermitId: null,
        authStatus: null,
        submittedDate: null,
        adjudicationDate: null
      }));
    }

    if (data.investigatePermits && data.investigatePermits.length) {
      investigatePermits = data.investigatePermits.map((x: Permit) => ({
        permitId: x.permitId as string,
        permitTypeId: x.permitTypeId as number,
        activityId: activityId as string,
        trackingId: null,
        status: null,
        needed: PermitNeeded.UNDER_INVESTIGATION,
        statusLastVerified: x.statusLastVerified,
        issuedPermitId: null,
        authStatus: null,
        submittedDate: null,
        adjudicationDate: null
      }));
    }

    // Put new submission together
    const submissionData = {
      submission: {
        ...applicant,
        ...basic,
        ...housing,
        ...location,
        ...permits,
        submissionId: data.submissionId ?? uuidv4(),
        activityId: activityId,
        submittedAt: data.submittedAt ?? new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submittedBy: getCurrentUsername(req.currentContext),
        intakeStatus: intakeStatus,
        applicationStatus: data.applicationStatus ?? ApplicationStatus.NEW,
        submissionType: data?.submissionType ?? SubmissionType.GUIDANCE
      } as Submission,
      appliedPermits,
      investigatePermits
    };

    if (data.submit) {
      controller.assignPriority(submissionData.submission);
    }

    return submissionData;
  },

  getActivityIds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let response = await submissionService.getSubmissions();
      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter((x: Submission) => x?.submittedBy === getCurrentUsername(req.currentContext));
      }
      res.status(200).json(response.map((x) => x.activityId));
    } catch (e: unknown) {
      next(e);
    }
  },

  createDraft: async (req: Request<never, never, SubmissionIntake>, res: Response, next: NextFunction) => {
    try {
      const { submission, appliedPermits, investigatePermits } = await controller.generateSubmissionData(
        req,
        req.body.submit ? IntakeStatus.SUBMITTED : IntakeStatus.DRAFT
      );

      // Create new submission
      const result = await submissionService.createSubmission({
        ...submission,
        ...generateCreateStamps(req.currentContext)
      });

      // Create each permit
      await Promise.all(appliedPermits.map(async (x: Permit) => await permitService.createPermit(x)));
      await Promise.all(investigatePermits.map(async (x: Permit) => await permitService.createPermit(x)));
      res.status(201).json({ activityId: result.activityId, submissionId: result.submissionId });
    } catch (e: unknown) {
      next(e);
    }
  },

  createSubmission: async (req: Request<never, never, SubmissionIntake>, res: Response, next: NextFunction) => {
    try {
      const { submission, appliedPermits, investigatePermits } = await controller.generateSubmissionData(
        req,
        IntakeStatus.SUBMITTED
      );

      // Create new submission
      const result = await submissionService.createSubmission({
        ...submission,
        ...generateCreateStamps(req.currentContext)
      });

      // Create each permit
      await Promise.all(appliedPermits.map(async (x: Permit) => await permitService.createPermit(x)));
      await Promise.all(investigatePermits.map(async (x: Permit) => await permitService.createPermit(x)));

      res.status(201).json({ activityId: result.activityId, submissionId: result.submissionId });
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteSubmission: async (req: Request<{ submissionId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await submissionService.deleteSubmission(req.params.submissionId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getStatistics: async (req: Request<never, never, never, StatisticsFilters>, res: Response, next: NextFunction) => {
    try {
      const response = await submissionService.getStatistics(req.query);
      res.status(200).json(response[0]);
    } catch (e: unknown) {
      next(e);
    }
  },

  getSubmission: async (req: Request<{ submissionId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await submissionService.getSubmission(req.params.submissionId);

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        if (response?.submittedBy !== getCurrentUsername(req.currentContext)) {
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

  getSubmissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check for and store new submissions in CHEFS
      await controller.checkAndStoreNewSubmissions();

      // Pull from PCNS database
      let response = await submissionService.getSubmissions();

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter((x: Submission) => x?.submittedBy === getCurrentUsername(req.currentContext));
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchSubmissions: async (
    req: Request<never, never, never, SubmissionSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let response = await submissionService.searchSubmissions({
        ...req.query,
        includeUser: isTruthy(req.query.includeUser)
      });

      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        response = response.filter((x: Submission) => x?.submittedBy === getCurrentUsername(req.currentContext));
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateDraft: async (req: Request<never, never, SubmissionIntake>, res: Response, next: NextFunction) => {
    try {
      const { submission, appliedPermits, investigatePermits } = await controller.generateSubmissionData(
        req,
        req.body.submit ? IntakeStatus.SUBMITTED : IntakeStatus.DRAFT
      );

      // Update submission
      const result = await submissionService.updateSubmission({
        ...submission,
        ...generateUpdateStamps(req.currentContext)
      });

      // Remove already existing permits for this activity
      await permitService.deletePermitsByActivity(submission.activityId);

      // Create each permit
      await Promise.all(appliedPermits.map(async (x: Permit) => await permitService.createPermit(x)));
      await Promise.all(investigatePermits.map(async (x: Permit) => await permitService.createPermit(x)));

      res.status(200).json({ activityId: result.activityId, submissionId: result.submissionId });
    } catch (e: unknown) {
      next(e);
    }
  },

  updateIsDeletedFlag: async (
    req: Request<{ submissionId: string }, never, { isDeleted: boolean }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await submissionService.updateIsDeletedFlag(
        req.params.submissionId,
        req.body.isDeleted,
        generateUpdateStamps(req.currentContext)
      );
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateSubmission: async (req: Request<never, never, Submission>, res: Response, next: NextFunction) => {
    try {
      const response = await submissionService.updateSubmission({
        ...req.body,
        ...generateUpdateStamps(req.currentContext)
      });
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * @function emailConfirmation
   * Send an email with the confirmation of submission
   */
  emailConfirmation: async (req: Request<never, never, Email>, res: Response, next: NextFunction) => {
    try {
      const { data, status } = await emailService.email(req.body);
      res.status(status).json(data);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * @function assignPriority
   * Assigns a priority level to a submission based on given criteria
   * Criteria defined below
   */
  assignPriority: (submission: Partial<Submission>) => {
    const matchesPriorityOneCriteria = // Priority 1 Criteria:
      submission.singleFamilyUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED || // 1. More than 50 units (any)
      submission.singleFamilyUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
      submission.multiFamilyUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
      submission.multiFamilyUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
      submission.otherUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
      submission.otherUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
      submission.hasRentalUnits === 'Yes' || // 2. Supports Rental Units
      submission.financiallySupportedBC === 'Yes' || // 3. Social Housing
      submission.financiallySupportedIndigenous === 'Yes'; // 4. Indigenous Led

    const matchesPriorityTwoCriteria = // Priority 2 Criteria:
      submission.singleFamilyUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE || // 1. Single Family >= 10 Units
      submission.multiFamilyUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE || // 2. Has 1 or more MultiFamily Units
      submission.multiFamilyUnits === NumResidentialUnits.ONE_TO_NINE ||
      submission.otherUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE || // 3. Has 1 or more Other Units
      submission.otherUnits === NumResidentialUnits.ONE_TO_NINE;

    if (matchesPriorityOneCriteria) {
      submission.queuePriority = 1;
    } else if (matchesPriorityTwoCriteria) {
      submission.queuePriority = 2;
    } else {
      // Prioriy 3 Criteria:
      submission.queuePriority = 3; // Everything Else
    }
  }
};

export default controller;
