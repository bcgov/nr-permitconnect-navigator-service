import config from 'config';
import { NIL, v4 as uuidv4 } from 'uuid';

import { APPLICATION_STATUS_LIST } from '../components/constants';
import { camelCaseToTitleCase, deDupeUnsure, getCurrentIdentity, isTruthy, toTitleCase } from '../components/utils';
import { submissionService, permitService, userService } from '../services';

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
              financiallySupportedBC: isTruthy(data.isBCHousingSupported),
              financiallySupportedIndigenous: isTruthy(data.isIndigenousHousingProviderSupported),
              financiallySupportedNonProfit: isTruthy(data.isNonProfitSupported),
              financiallySupportedHousingCoop: isTruthy(data.isHousingCooperativeSupported)
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
              financiallySupported: Object.values(financiallySupportedValues).includes(true),
              ...financiallySupportedValues,
              intakeStatus: toTitleCase(data.form.status),
              locationPIDs: data.parcelID,
              latitude: data.latitude,
              longitude: data.longitude,
              naturalDisaster: data.naturalDisasterInd,
              queuePriority: parseInt(data.queuePriority),
              singleFamilyUnits: maxUnits,
              isRentalUnit: camelCaseToTitleCase(deDupeUnsure(data.isRentalUnit)),
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

  getSubmission: async (req: Request<{ activityId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await submissionService.getSubmission(req.params.activityId);
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
      const response = await submissionService.getSubmissions();
      res.status(200).json(response);
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
