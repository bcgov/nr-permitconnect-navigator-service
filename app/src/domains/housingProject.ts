import { randomUUID } from 'node:crypto';

import { createActivity } from './activity';
import { buildNewPermitRecord } from './permit';
import { PermitStage, PermitState } from '#src/db/codes/enums';
import { jsonToPrismaInputJson } from '#src/db/utils/utils';
import { getCurrentUsername } from '#src/utils/index';
import { BasicResponse, Initiative } from '#src/utils/enums/application';
import { NumResidentialUnits } from '#src/utils/enums/housing';
import { PermitNeeded } from '#src/utils/enums/permit';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { Prisma } from '@prisma/client';
import type { Repositories } from '#src/db/unitOfWork';
import type {
  CurrentContext,
  HousingProject,
  HousingProjectBase,
  PermitTrackingBase,
  SubmitHousingProjectDraftRequest
} from '#types';

/**
 * Assigns a priority level to a housing project based on given criteria
 * Criteria defined below
 * @param housingProject Housing data
 */
export const assignPriority = (housingProject: Partial<HousingProject>) => {
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
    housingProject.financiallySupportedBc === 'Yes' ||
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
};

/**
 * Builds a blank housing project shell (POST / always sends an empty body - the frontend
 * fills fields in afterward via patch, or via submitHousingProjectData for a full intake).
 * @param repositories - The required repositories
 * @param currentContext - The current context of the request
 * @returns A new, mostly-empty project and permit data
 */
export const createHousingProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  currentContext: CurrentContext
) => {
  const [activity, contacts] = await Promise.all([
    createActivity({ activity: repositories.activity, initiative: repositories.initiative }, Initiative.HOUSING),
    repositories.contact.search({ userId: [currentContext.userId!] })
  ]);

  const activityId = activity?.activityId;
  if (!activityId) throw new Error('Failed to generate activity ID');

  const submittedBy = getCurrentUsername(currentContext);
  if (!submittedBy) throw new Error('Failed to determine submittedBy');

  if (contacts[0]) {
    await repositories.activityContact.create({
      activityId,
      contactId: contacts[0].contactId,
      role: ActivityContactRole.PRIMARY
    });
  }

  const housingProjectData = {
    housingProject: {
      housingProjectId: randomUUID(),
      activityId,
      submittedAt: new Date(),
      submittedBy,
      applicationStatus: ApplicationStatus.NEW,
      submissionType: SubmissionType.GUIDANCE
    } as HousingProjectBase,
    appliedPermits: [] as ReturnType<typeof buildNewPermitRecord>[],
    investigatePermits: [] as ReturnType<typeof buildNewPermitRecord>[],
    appliedPermitTrackers: [] as PermitTrackingBase[]
  };

  assignPriority(housingProjectData.housingProject);

  return housingProjectData;
};

/**
 * Transforms a full intake submission to match DB schema
 * @param repositories - The required repositories
 * @param data - Intake data
 * @param currentContext - The current context of the request
 * @returns Transformed project and permit data
 */
export const generateHousingProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  data: SubmitHousingProjectDraftRequest,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required (a draft may already have one)
  if (!activityId) {
    const [activity, contacts] = await Promise.all([
      createActivity({ activity: repositories.activity, initiative: repositories.initiative }, Initiative.HOUSING),
      repositories.contact.search({ userId: [currentContext.userId!] })
    ]);

    activityId = activity?.activityId;

    if (contacts[0]) {
      await repositories.activityContact.create({
        activityId,
        contactId: contacts[0].contactId,
        role: ActivityContactRole.PRIMARY
      });
    }
  }

  if (!activityId) throw new Error('Failed to generate activity ID');

  const submittedBy = getCurrentUsername(currentContext);
  if (!submittedBy) throw new Error('Failed to determine submittedBy');

  const basic = {
    consentToFeedback: data.basic.consentToFeedback,
    projectApplicantType: data.basic.projectApplicantType,
    companyIdRegistered: data.basic.registeredId ?? null,
    companyNameRegistered: data.basic.registeredName ?? null,
    projectName: data.basic.projectName,
    projectDescription: data.basic.projectDescription
  };

  const housing = {
    singleFamilyUnits: data.housing.singleFamilyUnits ?? null,
    multiFamilyUnits: data.housing.multiFamilyUnits ?? null,
    otherUnitsDescription: data.housing.otherUnitsDescription ?? null,
    otherUnits: data.housing.otherUnits ?? null,
    hasRentalUnits: data.housing.hasRentalUnits,
    financiallySupportedBc: data.housing.financiallySupportedBc,
    financiallySupportedIndigenous: data.housing.financiallySupportedIndigenous,
    financiallySupportedNonProfit: data.housing.financiallySupportedNonProfit,
    financiallySupportedHousingCoop: data.housing.financiallySupportedHousingCoop,
    rentalUnits: data.housing.rentalUnits ?? null,
    indigenousDescription: data.housing.indigenousDescription ?? null,
    nonProfitDescription: data.housing.nonProfitDescription ?? null,
    housingCoopDescription: data.housing.housingCoopDescription ?? null
  };

  const location = {
    naturalDisaster: (data.location.naturalDisaster as BasicResponse) === BasicResponse.YES,
    projectLocation: data.location.projectLocation,
    projectLocationDescription: data.location.projectLocationDescription ?? null,
    geomarkUrl: data.location.geomarkUrl ?? null,
    // jsonToPrismaInputJson returns the write-side JSON type; HousingProjectBase is a read-payload
    // type expecting JsonValue - same read/write split as latitude/longitude above.
    geoJson: jsonToPrismaInputJson(data.location.geoJson as Prisma.JsonValue) as unknown as Prisma.JsonValue,
    locationPids: data.location.ltsaPidLookup ?? null,
    // Prisma's write-side create input accepts a plain number for a Decimal column; HousingProjectBase
    // is a read-payload type, so it types these as Decimal - cast is narrowly for that mismatch.
    latitude: (data.location.latitude ?? null) as unknown as Prisma.Decimal | null,
    longitude: (data.location.longitude ?? null) as unknown as Prisma.Decimal | null,
    locality: data.location.locality ?? null,
    province: data.location.province ?? null,
    streetAddress: data.location.streetAddress ?? null
  };

  const permits = {
    hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
  };

  let appliedPermits: ReturnType<typeof buildNewPermitRecord>[] = [];
  let investigatePermits: ReturnType<typeof buildNewPermitRecord>[] = [];
  const appliedPermitTrackers: PermitTrackingBase[] = [];

  if (data.permits.appliedPermits?.length) {
    appliedPermits = data.permits.appliedPermits.map((x) => {
      const permitId = randomUUID();

      // Add each tracker for this permit with the proper permitId
      x.permitTracking?.forEach((pt) => appliedPermitTrackers.push({ ...pt, permitId } as PermitTrackingBase));

      return buildNewPermitRecord({
        permitId,
        permitTypeId: x.permitTypeId,
        activityId,
        stage: PermitStage.APPLICATION_SUBMISSION,
        needed: PermitNeeded.YES,
        state: PermitState.IN_PROGRESS,
        submittedDate: x.submittedDate
      });
    });
  }

  if (data.permits.investigatePermits?.length) {
    investigatePermits = data.permits.investigatePermits.map((x) =>
      buildNewPermitRecord({
        permitId: randomUUID(),
        permitTypeId: x.permitTypeId,
        activityId,
        stage: PermitStage.PRE_SUBMISSION,
        needed: PermitNeeded.UNDER_INVESTIGATION,
        state: PermitState.NONE
      })
    );
  }

  // Put new housing project together
  const housingProjectData = {
    housingProject: {
      ...basic,
      ...housing,
      ...location,
      ...permits,
      housingProjectId: randomUUID(),
      activityId: activityId,
      submittedAt: new Date(),
      submittedBy,
      applicationStatus: ApplicationStatus.NEW,
      submissionType: SubmissionType.GUIDANCE,
      createdAt: null,
      createdBy: null,
      updatedAt: null,
      updatedBy: null,
      deletedAt: null,
      deletedBy: null,
      aaiUpdated: false,
      assignedUserId: null,
      queuePriority: null,
      relatedPermits: null,
      astNotes: null,
      astUpdated: false,
      addedToAts: false,
      atsClientId: null,
      ltsaCompleted: false,
      bcOnlineCompleted: false,
      financiallySupported: [
        data.housing.financiallySupportedBc,
        data.housing.financiallySupportedIndigenous,
        data.housing.financiallySupportedNonProfit,
        data.housing.financiallySupportedHousingCoop
      ].includes(BasicResponse.YES),
      checkProvincialPermits: null,
      atsEnquiryId: null
    } satisfies HousingProjectBase,
    appliedPermits,
    investigatePermits,
    appliedPermitTrackers
  };

  assignPriority(housingProjectData.housingProject);

  return housingProjectData;
};
