import config from 'config';
import { NIL, v4 as uuidv4 } from 'uuid';

import {
  APPLICATION_STATUS_LIST,
  INTAKE_STATUS_LIST,
  Initiatives,
  PERMIT_NEEDED,
  PERMIT_STATUS,
  YES_NO,
  YES_NO_UNSURE
} from '../components/constants';
import { camelCaseToTitleCase, deDupeUnsure, getCurrentIdentity, isTruthy, toTitleCase } from '../components/utils';
import { activityService, submissionService, permitService, userService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { ChefsFormConfig, ChefsFormConfigData, Submission, ChefsSubmissionExport, Permit } from '../types';

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
              financiallySupportedBC: data.isBCHousingSupported ? toTitleCase(data.isBCHousingSupported) : YES_NO.NO,
              financiallySupportedIndigenous: data.isIndigenousHousingProviderSupported
                ? toTitleCase(data.isIndigenousHousingProviderSupported)
                : YES_NO.NO,
              financiallySupportedNonProfit: data.isNonProfitSupported
                ? toTitleCase(data.isNonProfitSupported)
                : YES_NO.NO,
              financiallySupportedHousingCoop: data.isHousingCooperativeSupported
                ? toTitleCase(data.isHousingCooperativeSupported)
                : YES_NO.NO
            };

            // Get greatest of multiple Units data
            const unitData = [data.singleFamilyUnits, data.multiFamilyUnits, data.multiFamilyUnits1].sort();

            // Replace text instances with symbols
            const parsedUnitData = unitData.map((element) => {
              if (typeof element === 'string') {
                return element?.replace('greaterthan', '>');
              } else {
                return element;
              }
            });

            const maxUnits = parsedUnitData.reduce(
              (ac, value) => {
                // Unit types are in the form of '1-49' or '>500'
                // .match() with regex '/(\d+)(?!.*\d)/' matches the last number in a string, puts it in array.
                // Get max integer from last element of array.
                let upperRange: number = 0;
                if (value) {
                  upperRange = parseInt(
                    value
                      .toString()
                      .match(/(\d+)(?!.*\d)/)
                      ?.pop() ?? '0'
                  );
                }
                // Compare with accumulator
                return upperRange > ac.upperRange ? { value: value, upperRange: upperRange } : ac;
              },
              { upperRange: 0, value: '' } // Initial value
            ).value;

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
                  }) => {
                    const permit = permitTypes.find((y) => y.type === shasPermitMapping.get(x.previousPermitType));
                    if (permit) {
                      return {
                        permitId: uuidv4(),
                        permitTypeId: permit.permitTypeId,
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
              applicationStatus: APPLICATION_STATUS_LIST.NEW,
              companyNameRegistered: data.companyNameRegistered,
              contactEmail: data.contactEmail,
              contactPreference: camelCaseToTitleCase(data.contactPreference),
              projectName: data.projectName,
              projectDescription: data.projectDescription,
              contactPhoneNumber: data.contactPhoneNumber,
              contactName: `${data.contactFirstName} ${data.contactLastName}`,
              contactApplicantRelationship: camelCaseToTitleCase(data.contactApplicantRelationship),
              financiallySupported: Object.values(financiallySupportedValues).includes(YES_NO.YES),
              ...financiallySupportedValues,
              intakeStatus: toTitleCase(data.form.status),
              locationPIDs: data.parcelID,
              latitude: data.latitude,
              longitude: data.longitude,
              naturalDisaster: data.naturalDisasterInd,
              queuePriority: parseInt(data.queuePriority),
              singleFamilyUnits: maxUnits,
              hasRentalUnits: data.isRentalUnit
                ? camelCaseToTitleCase(deDupeUnsure(data.isRentalUnit))
                : YES_NO_UNSURE.UNSURE,
              streetAddress: data.streetAddress,
              submittedAt: data.form.createdAt,
              submittedBy: data.form.username,
              permits: permits
            };
          });
        })
      ).then((x) => x.filter((y) => y.length).flat());

    // Get a list of all activity IDs currently in our DB
    const stored = (
      await submissionService.searchSubmissions({
        activityId: exportData.map((x) => x.activityId as string)
      })
    ).map((x) => x?.activityId);

    // Create new activities
    const notStored = exportData.filter((x) => !stored.some((activityId) => activityId === x.activityId));
    await submissionService.createSubmissionsFromExport(notStored);

    // Create each permit
    notStored.map((x) => x.permits?.map(async (y) => await permitService.createPermit(y)));
  },

  generateSubmissionData: async (req: Request, intakeStatus: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = req.body;

    const activityId = data.activityId ?? (await activityService.createActivity(Initiatives.HOUSING))?.activityId;

    let applicant, basic, housing, location, permits;
    let appliedPermits: Array<Permit> = [],
      investigatePermits: Array<Permit> = [];

    // Create applicant information
    if (data.applicant) {
      applicant = {
        contactName: `${data.applicant.firstName} ${data.applicant.lastName}`,
        contactPhoneNumber: data.applicant.phoneNumber,
        contactEmail: data.applicant.email,
        contactApplicantRelationship: data.applicant.relationshipToProject,
        contactPreference: data.applicant.contactPreference
      };
    }

    if (data.basic) {
      basic = {
        isDevelopedByCompanyOrOrg: data.basic.isDevelopedByCompanyOrOrg,
        isDevelopedInBC: data.basic.isDevelopedInBC,
        companyNameRegistered: data.basic.registeredName
      };
    }

    if (data.housing) {
      housing = {
        projectName: data.housing.projectName,
        projectDescription: data.housing.projectDescription,
        //singleFamilySelected: true, // not necessary to save - check if singleFamilyUnits not null
        //multiFamilySelected: true, // not necessary to save - check if multiFamilyUnits not null
        singleFamilyUnits: data.housing.singleFamilyUnits,
        multiFamilyUnits: data.housing.multiFamilyUnits,
        //otherSelected: true, // not necessary to save - check if otherUnits not null
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
        naturalDisaster: data.location.naturalDisaster === YES_NO.YES,
        projectLocation: data.location.projectLocation,
        projectLocationDescription: data.location.projectLocationDescription,
        locationPIDs: data.location.ltsaPIDLookup,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        //addressSearch: 'Search address', // not necessary to save - client side search field
        streetAddress: data.location.streetAddress,
        locality: data.location.locality,
        province: data.location.province
      };
    }

    if (data.permits) {
      permits = {
        hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits,
        checkProvincialPermits: data.permits.checkProvincialPermits
      };
    }

    if (data.appliedPermits && data.appliedPermits.length) {
      appliedPermits = data.appliedPermits.map((x: Permit) => ({
        permitId: x.permitId,
        permitTypeId: x.permitTypeId,
        activityId: activityId,
        trackingId: x.trackingId,
        status: PERMIT_STATUS.APPLIED,
        statusLastVerified: x.statusLastVerified
      }));
    }

    if (data.investigatePermits && data.investigatePermits.length) {
      investigatePermits = data.investigatePermits.flatMap((x: Permit) => ({
        permitId: x.permitId,
        permitTypeId: x.permitTypeId,
        activityId: activityId,
        needed: PERMIT_NEEDED.UNDER_INVESTIGATION,
        statusLastVerified: x.statusLastVerified
      }));
    }

    // Put new submission together
    return {
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
        submittedBy: (req.currentUser?.tokenPayload as any)?.idir_username,
        intakeStatus: intakeStatus,
        applicationStatus: data.applicationStatus ?? APPLICATION_STATUS_LIST.NEW
      },
      appliedPermits,
      investigatePermits
    };
  },

  createDraft: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = req.body;

      const { submission, appliedPermits, investigatePermits } = await controller.generateSubmissionData(
        req,
        data.submit ? INTAKE_STATUS_LIST.SUBMITTED : INTAKE_STATUS_LIST.DRAFT
      );

      // Create new submission
      const result = await submissionService.createSubmission(submission);

      // Create each permit
      await Promise.all(appliedPermits.map(async (x: Permit) => await permitService.createPermit(x)));
      await Promise.all(investigatePermits.map(async (x: Permit) => await permitService.createPermit(x)));

      res.status(201).json({ activityId: result.activityId, submissionId: result.submissionId });
    } catch (e: unknown) {
      next(e);
    }
  },

  createSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { submission, appliedPermits, investigatePermits } = await controller.generateSubmissionData(
        req,
        INTAKE_STATUS_LIST.SUBMITTED
      );

      // Create new submission
      const result = await submissionService.createSubmission(submission);

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

  getStatistics: async (
    req: Request<never, { dateFrom: string; dateTo: string; monthYear: string; userId: string }>,
    res: Response,
    next: NextFunction
  ) => {
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
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getSubmissions: async (req: Request<never, { self?: string }>, res: Response, next: NextFunction) => {
    try {
      // Check for and store new submissions in CHEFS
      await controller.checkAndStoreNewSubmissions();

      // Pull from PCNS database
      let response = await submissionService.getSubmissions();

      if (isTruthy(req.query.self)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response = response.filter((x) => x?.submittedBy === (req.currentUser?.tokenPayload as any)?.idir_username);
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateDraft: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = req.body;

      const { submission, appliedPermits, investigatePermits } = await controller.generateSubmissionData(
        req,
        data.submit ? INTAKE_STATUS_LIST.SUBMITTED : INTAKE_STATUS_LIST.DRAFT
      );

      // Update submission
      const result = await submissionService.updateSubmission(submission as Submission);

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

  updateSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);
      const response = await submissionService.updateSubmission({ ...(req.body as Submission), updatedBy: userId });
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
