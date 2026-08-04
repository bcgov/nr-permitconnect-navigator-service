import { randomUUID } from 'node:crypto';

import { createActivity } from './activity';
import { buildNewPermitRecord } from './permit';
import { PermitStage, PermitState } from '../db/codes/enums';
import { jsonToPrismaInputJson } from '../db/utils/utils';
import { BasicResponse, Initiative } from '../utils/enums/application';
import { PermitNeeded } from '../utils/enums/permit';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';

import type { Repositories } from '../db/unitOfWork';
import type {
  CurrentContext,
  GeneralProjectBase,
  GeneralProjectIntake,
  Permit,
  PermitTrackingBase,
  UpsertPermitRequest
} from '../types';

/**
 * Transforms intake data to match DB schema
 * @param repositories - The required repositories
 * @param data - Intake data
 * @param currentContext - The current context of the request
 * @returns Transformed project and permit data
 */
export const generateGeneralProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  data: GeneralProjectIntake,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required
  if (!activityId) {
    activityId = (
      await createActivity({ activity: repositories.activity, initiative: repositories.initiative }, Initiative.GENERAL)
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

  let basic, location, permits;
  let appliedPermits: UpsertPermitRequest[] = [],
    investigatePermits: UpsertPermitRequest[] = [];
  const appliedPermitTrackers: PermitTrackingBase[] = [];

  if (data.basic) {
    basic = {
      projectApplicantType: data.basic.projectApplicantType,
      companyIdRegistered: data.basic.registeredId,
      companyNameRegistered: data.basic.registeredName,
      projectName: data.basic.projectName,
      projectNumber: data.basic.projectNumber,
      projectDescription: data.basic.projectDescription
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
      streetAddress: data.location.streetAddress,
      locality: data.location.locality,
      province: data.location.province
    };
  }

  if (data.permits) {
    permits = {
      hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
    };

    if (data.permits.appliedPermits?.length) {
      appliedPermits = data.permits.appliedPermits.map((x: Permit) => {
        const permitId = x.permitId ?? randomUUID();

        // Add each tracker for this permit with the proper permitId
        x.permitTracking?.forEach((pt) => appliedPermitTrackers.push({ ...pt, permitId }));

        return buildNewPermitRecord({
          permitId,
          permitTypeId: x.permitTypeId,
          activityId,
          stage: PermitStage.APPLICATION_SUBMISSION,
          needed: PermitNeeded.YES,
          state: PermitState.IN_PROGRESS,
          submittedDate: x.submittedDate,
          submittedTime: x.submittedTime
        });
      });
    }

    if (data.permits.investigatePermits?.length) {
      investigatePermits = data.permits.investigatePermits.map((x: Permit) =>
        buildNewPermitRecord({
          permitId: x.permitId ?? randomUUID(),
          permitTypeId: x.permitTypeId,
          activityId,
          stage: PermitStage.PRE_SUBMISSION,
          needed: PermitNeeded.UNDER_INVESTIGATION,
          state: PermitState.NONE,
          submittedTime: x.submittedTime
        })
      );
    }
  }

  // Put new general project together
  const generalProjectData = {
    generalProject: {
      ...basic,
      ...location,
      ...permits,
      generalProjectId: randomUUID(),
      activityId: activityId,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
      applicationStatus: data.applicationStatus ?? ApplicationStatus.NEW,
      submissionType: data?.submissionType ?? SubmissionType.GUIDANCE,
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
      atsClientId: null,
      checkProvincialPermits: null,
      atsEnquiryId: null,
      region: null,
      area: null,
      activityType: null,
      businessArea: null
    } as GeneralProjectBase,
    appliedPermits,
    investigatePermits,
    appliedPermitTrackers
  };

  return generalProjectData;
};
