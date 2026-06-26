import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { NumResidentialUnits } from '../utils/enums/housing';

import type {
  Contact,
  CurrentContext,
  HousingProject,
  HousingProjectBase,
  HousingProjectIntake,
  Permit,
  PermitTracking
} from '../types';
import { BasicResponse, Initiative } from '../utils/enums/application';
import { getCurrentUsername, toTitleCase } from '../utils';
import { confirmationTemplateHousingSubmission } from '../utils/templates';
import { PermitStage, PermitState } from '../db/codes/enums';
import { PermitNeeded } from '../utils/enums/permit';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';
import { Repositories } from '../repository/uow';
import { jsonToPrismaInputJson } from '../db/utils/utils';
import { UpsertPermitRequest } from '../types/requests';
import { email } from '../services/email';
import { createActivity } from './activity';

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
 * Generates and sends a templated email with the given data
 * @param projectWithContact Email data
 */
export async function emailProjectConfirmation(projectWithContact: HousingProject & { contact: Contact }) {
  const configCC = config.get<string>('server.ches.submission.cc');

  const body = confirmationTemplateHousingSubmission({
    contactName:
      projectWithContact.contact?.firstName && projectWithContact.contact?.lastName
        ? `${projectWithContact.contact?.firstName} ${projectWithContact.contact?.lastName}`
        : '',
    initiative: toTitleCase(Initiative.HOUSING),
    activityId: projectWithContact.activityId,
    projectId: projectWithContact.housingProjectId
  });

  const emailData = {
    from: configCC,
    to: [projectWithContact.contact.email!],
    cc: [configCC],
    subject: 'Confirmation of Project Submission',
    bodyType: 'html',
    body: body
  };

  await email(emailData);
}

/**
 * Transforms intake data to match DB schema
 * @param repositories - The required repositories
 * @param data - Intake data
 * @param currentContext - The current context of the request
 * @returns Transformed project and permit data
 */
export const generateHousingProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'housingProject' | 'initiative'>,
  data: HousingProjectIntake,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required
  if (!activityId) {
    activityId = (
      await createActivity({ activity: repositories.activity, initiative: repositories.initiative }, Initiative.HOUSING)
    )?.activityId;

    const contacts = await repositories.contact.search({ userId: [currentContext.userId!] });
    if (contacts[0]) {
      await repositories.activityContact.create({
        activityId,
        contactId: contacts[0].contactId,
        role: ActivityContactRole.PRIMARY
      });
    }
  }

  if (!activityId) throw new Error('Failed to generate activity ID');

  let basic, housing, location, permits;
  let appliedPermits: UpsertPermitRequest[] = [],
    investigatePermits: UpsertPermitRequest[] = [];
  const appliedPermitTrackers: PermitTracking[] = [];

  if (data.basic) {
    basic = {
      consentToFeedback: data.basic.consentToFeedback ?? false,
      projectApplicantType: data.basic.projectApplicantType,
      companyIdRegistered: data.basic.registeredId,
      companyNameRegistered: data.basic.registeredName,
      projectName: data.basic.projectName,
      projectDescription: data.basic.projectDescription
    };
  }

  if (data.housing) {
    housing = {
      singleFamilyUnits: data.housing.singleFamilyUnits,
      multiFamilyUnits: data.housing.multiFamilyUnits,
      otherUnitsDescription: data.housing.otherUnitsDescription,
      otherUnits: data.housing.otherUnits,
      hasRentalUnits: data.housing.hasRentalUnits,
      financiallySupportedBc: data.housing.financiallySupportedBc,
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
      naturalDisaster: (data.location.naturalDisaster as BasicResponse) === BasicResponse.YES,
      projectLocation: data.location.projectLocation,
      projectLocationDescription: data.location.projectLocationDescription,
      geomarkUrl: data.location.geomarkUrl,
      geoJson: jsonToPrismaInputJson(data.location.geoJson),
      locationPids: data.location.ltsaPidLookup,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      locality: data.location.locality,
      province: data.location.province,
      streetAddress: data.location.streetAddress
    };
  }

  if (data.permits) {
    permits = {
      hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
    };

    if (data.permits.appliedPermits?.length) {
      appliedPermits = data.permits.appliedPermits.map((x: Permit) => {
        const permitId = x.permitId ?? uuidv4();

        // Add each tracker for this permit with the proper permitId
        x.permitTracking?.forEach((pt) => appliedPermitTrackers.push({ ...pt, permitId }));

        return {
          permitId,
          permitTypeId: x.permitTypeId,
          activityId: activityId,
          stage: PermitStage.APPLICATION_SUBMISSION,
          needed: PermitNeeded.YES,
          statusLastChanged: null,
          statusLastChangedTime: null,
          statusLastVerified: null,
          statusLastVerifiedTime: null,
          issuedPermitId: null,
          state: PermitState.IN_PROGRESS,
          onHoldCode: null,
          submittedDate: x.submittedDate,
          submittedTime: x.submittedTime,
          decisionDate: null,
          decisionTime: null,
          targetDate: null,
          targetDateDescription: null
        };
      });
    }

    if (data.permits.investigatePermits?.length) {
      investigatePermits = data.permits.investigatePermits.map((x: Permit) => ({
        permitId: x.permitId ?? uuidv4(),
        permitTypeId: x.permitTypeId,
        activityId: activityId,
        stage: PermitStage.PRE_SUBMISSION,
        needed: PermitNeeded.UNDER_INVESTIGATION,
        statusLastChanged: null,
        statusLastChangedTime: null,
        statusLastVerified: null,
        statusLastVerifiedTime: null,
        issuedPermitId: null,
        state: PermitState.NONE,
        onHoldCode: null,
        submittedDate: null,
        submittedTime: x.submittedTime,
        decisionDate: null,
        decisionTime: null,
        targetDate: null,
        targetDateDescription: null
      }));
    }
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
      submittedAt: new Date(),
      submittedBy: getCurrentUsername(currentContext),
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
        data.housing?.financiallySupportedBc,
        data.housing?.financiallySupportedIndigenous,
        data.housing?.financiallySupportedNonProfit,
        data.housing?.financiallySupportedHousingCoop
      ].includes(BasicResponse.YES),
      checkProvincialPermits: null,
      atsEnquiryId: null
    } as HousingProjectBase,
    appliedPermits,
    investigatePermits,
    appliedPermitTrackers
  };

  assignPriority(housingProjectData.housingProject);

  return housingProjectData;
};
