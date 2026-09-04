import { randomUUID } from 'node:crypto';

import { ensureActivityWithPrimaryContact } from './activity';
import { Initiative } from '#src/utils/enums/application';
import { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { Repositories } from '#src/db/unitOfWork';
import type { CurrentContext, ElectrificationProjectCreateInput, SubmitElectrificationProjectDraftInput } from '#types';

/**
 * Builds a blank electrification project shell (POST / always sends an empty body - the frontend
 * fills fields in afterward via patch, or via generateElectrificationProjectData for a full intake).
 * @param repositories - The required repositories
 * @param currentContext - The current context of the request
 * @returns A new, mostly-empty project
 */
export const createElectrificationProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  currentContext: CurrentContext
) => {
  const activityId = await ensureActivityWithPrimaryContact(repositories, Initiative.ELECTRIFICATION, currentContext);

  return {
    electrificationProjectId: randomUUID(),
    activityId,
    submittedAt: new Date(),
    applicationStatus: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE
  } satisfies ElectrificationProjectCreateInput;
};

/**
 * Transforms a full intake submission to match DB schema
 * @param repositories - The required repositories
 * @param data - Intake data
 * @param currentContext - The current context of the request
 * @returns Transformed project data
 */
export const generateElectrificationProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  data: SubmitElectrificationProjectDraftInput,
  currentContext: CurrentContext
) => {
  // Create activity and link contact if required (a draft may already have one)
  const activityId = await ensureActivityWithPrimaryContact(
    repositories,
    Initiative.ELECTRIFICATION,
    currentContext,
    data.activityId
  );

  // Put new electrification project together
  const electrificationProjectData = {
    companyIdRegistered: data.basic.registeredId ?? null,
    companyNameRegistered: data.basic.registeredName,
    projectName: data.basic.projectName,
    projectDescription: data.basic.projectDescription ?? null,
    bcHydroNumber: data.project.bcHydroNumber ?? null,
    projectType: data.project.projectType,
    electrificationProjectId: randomUUID(),
    activityId: activityId,
    submittedAt: new Date(),
    submissionType: SubmissionType.GUIDANCE,
    applicationStatus: ApplicationStatus.NEW,
    aaiUpdated: false,
    addedToAts: false,
    queuePriority: null
  } satisfies ElectrificationProjectCreateInput;

  return electrificationProjectData;
};
