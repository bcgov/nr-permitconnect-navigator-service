import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import type {
  Contact,
  CurrentContext,
  GeneralProject,
  GeneralProjectBase,
  GeneralProjectIntake,
  Permit,
  PermitTracking
} from '../types';
import { BasicResponse, Initiative } from '../utils/enums/application';
import { toTitleCase } from '../utils';
import { confirmationTemplateGeneralSubmission } from '../utils/templates';
import { PermitStage, PermitState } from '../db/codes/enums';
import { PermitNeeded } from '../utils/enums/permit';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';
import { Repositories } from '../repository/uow';
import { jsonToPrismaInputJson } from '../db/utils/utils';
import { UpsertPermitRequest } from '../types/requests';
import { email } from '../services/email';
import { createActivity } from './activity';

/**
 * Generates and sends a templated email with the given data
 * @param projectWithContact Email data
 */
export async function emailProjectConfirmation(projectWithContact: GeneralProject & { contact: Contact }) {
  const configCC = config.get<string>('server.ches.submission.cc');

  const body = confirmationTemplateGeneralSubmission({
    contactName:
      projectWithContact.contact?.firstName && projectWithContact.contact?.lastName
        ? `${projectWithContact.contact?.firstName} ${projectWithContact.contact?.lastName}`
        : '',
    initiative: toTitleCase(Initiative.GENERAL),
    activityId: projectWithContact.activityId,
    projectId: projectWithContact.generalProjectId
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
  const appliedPermitTrackers: PermitTracking[] = [];

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

  // Put new general project together
  const generalProjectData = {
    generalProject: {
      ...basic,
      ...location,
      ...permits,
      generalProjectId: uuidv4(),
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
