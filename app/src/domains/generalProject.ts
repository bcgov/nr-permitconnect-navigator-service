import { randomUUID } from 'node:crypto';

import { ensureActivityWithPrimaryContact } from './activity.ts';
import { buildIntakePermits } from './permit.ts';
import { jsonToPrismaInputJson } from '#src/db/utils/utils';
import { BasicResponse, Initiative } from '#src/utils/enums/application';
import { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { Repositories } from '#src/db/unitOfWork';
import type { CurrentContext, GeneralProjectCreateInput, SubmitGeneralProjectDraftInput } from '#types';

/**
 * Builds a blank general project shell (POST / always sends an empty body - the frontend
 * fills fields in afterward via patch, or via generateGeneralProjectData for a full intake).
 * @param repositories - The required repositories
 * @param currentContext - The current context of the request
 * @returns A new, mostly-empty project
 */
export const createGeneralProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  currentContext: CurrentContext
) => {
  const activityId = await ensureActivityWithPrimaryContact(repositories, Initiative.GENERAL, currentContext);

  return {
    generalProjectId: randomUUID(),
    activityId,
    submittedAt: new Date(),
    applicationStatus: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE
  } satisfies GeneralProjectCreateInput;
};

/**
 * Transforms a full intake submission to match DB schema
 * @param repositories - The required repositories
 * @param data - Intake data
 * @param currentContext - The current context of the request
 * @returns Transformed project and permit data
 */
export const generateGeneralProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  data: SubmitGeneralProjectDraftInput,
  currentContext: CurrentContext
) => {
  // Create activity and link contact if required (a draft may already have one)
  const activityId = await ensureActivityWithPrimaryContact(
    repositories,
    Initiative.GENERAL,
    currentContext,
    data.activityId
  );

  const basic = {
    projectApplicantType: data.basic.projectApplicantType,
    companyIdRegistered: data.basic.registeredId ?? null,
    companyNameRegistered: data.basic.registeredName ?? null,
    projectName: data.basic.projectName,
    projectNumber: data.basic.projectNumber ?? null,
    projectDescription: data.basic.projectDescription
  };

  const location = {
    naturalDisaster: (data.location.naturalDisaster as BasicResponse) === BasicResponse.YES,
    projectLocation: data.location.projectLocation,
    projectLocationDescription: data.location.projectLocationDescription ?? null,
    geomarkUrl: data.location.geomarkUrl ?? null,
    geoJson: jsonToPrismaInputJson(data.location.geoJson),
    locationPids: data.location.ltsaPidLookup ?? null,
    latitude: data.location.latitude ?? null,
    longitude: data.location.longitude ?? null,
    streetAddress: data.location.streetAddress ?? null,
    locality: data.location.locality ?? null,
    province: data.location.province ?? null
  };

  const permits = {
    hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
  };

  // Put new general project together
  const generalProjectData = {
    generalProject: {
      ...basic,
      ...location,
      ...permits,
      generalProjectId: randomUUID(),
      activityId: activityId,
      submittedAt: new Date(),
      applicationStatus: ApplicationStatus.NEW,
      submissionType: SubmissionType.GUIDANCE,
      aaiUpdated: false,
      assignedUserId: null,
      queuePriority: null
    } satisfies GeneralProjectCreateInput,
    ...buildIntakePermits(activityId, data.permits)
  };

  return generalProjectData;
};
