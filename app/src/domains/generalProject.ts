import { randomUUID } from 'node:crypto';

import { createActivity } from './activity';
import { buildNewPermitRecord } from './permit';
import { PermitStage, PermitState } from '#src/db/codes/enums';
import { jsonToPrismaInputJson } from '#src/db/utils/utils';
import { BasicResponse, Initiative } from '#src/utils/enums/application';
import { PermitNeeded } from '#src/utils/enums/permit';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { Prisma } from '@prisma/client';
import type { Repositories } from '#src/db/unitOfWork';
import type { CurrentContext, GeneralProjectBase, PermitTrackingBase, SubmitGeneralProjectDraftRequest } from '#types';

/**
 * Builds a blank general project shell (POST / always sends an empty body - the frontend
 * fills fields in afterward via patch, or via generateGeneralProjectData for a full intake).
 * @param repositories - The required repositories
 * @param currentContext - The current context of the request
 * @returns A new, mostly-empty project and permit data
 */
export const createGeneralProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  currentContext: CurrentContext
) => {
  const [activity, contacts] = await Promise.all([
    createActivity({ activity: repositories.activity, initiative: repositories.initiative }, Initiative.GENERAL),
    repositories.contact.search({ userId: [currentContext.userId!] })
  ]);

  const activityId = activity?.activityId;
  if (!activityId) throw new Error('Failed to generate activity ID');

  if (contacts[0]) {
    await repositories.activityContact.create({
      activityId,
      contactId: contacts[0].contactId,
      role: ActivityContactRole.PRIMARY
    });
  }

  return {
    generalProject: {
      generalProjectId: randomUUID(),
      activityId,
      submittedAt: new Date(),
      applicationStatus: ApplicationStatus.NEW,
      submissionType: SubmissionType.GUIDANCE
    } as GeneralProjectBase,
    appliedPermits: [] as ReturnType<typeof buildNewPermitRecord>[],
    investigatePermits: [] as ReturnType<typeof buildNewPermitRecord>[],
    appliedPermitTrackers: [] as PermitTrackingBase[]
  };
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
  data: SubmitGeneralProjectDraftRequest,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required (a draft may already have one)
  if (!activityId) {
    const [activity, contacts] = await Promise.all([
      createActivity({ activity: repositories.activity, initiative: repositories.initiative }, Initiative.GENERAL),
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
    // jsonToPrismaInputJson returns the write-side JSON type; GeneralProjectBase is a read-payload
    // type expecting JsonValue.
    geoJson: jsonToPrismaInputJson(data.location.geoJson as Prisma.JsonValue) as unknown as Prisma.JsonValue,
    locationPids: data.location.ltsaPidLookup ?? null,
    // Prisma's write-side create input accepts a plain number for a Decimal column; GeneralProjectBase
    // is a read-payload type, so it types these as Decimal.
    latitude: (data.location.latitude ?? null) as unknown as Prisma.Decimal | null,
    longitude: (data.location.longitude ?? null) as unknown as Prisma.Decimal | null,
    streetAddress: data.location.streetAddress ?? null,
    locality: data.location.locality ?? null,
    province: data.location.province ?? null
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
      // createdAt/createdBy are dead here - WritableRepository.create() always overwrites them via
      // withCreateAudit(), but satisfies requires every GeneralProjectBase key present.
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
    } satisfies GeneralProjectBase,
    appliedPermits,
    investigatePermits,
    appliedPermitTrackers
  };

  return generalProjectData;
};
