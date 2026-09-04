import { randomUUID } from 'node:crypto';

import { createActivity } from './activity';
import { Initiative } from '#src/utils/enums/application';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { Repositories } from '#src/db/unitOfWork';
import type {
  CurrentContext,
  ElectrificationProjectCreateInput,
  SubmitElectrificationProjectDraftRequest
} from '#types';

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
  const [activity, contacts] = await Promise.all([
    createActivity(
      { activity: repositories.activity, initiative: repositories.initiative },
      Initiative.ELECTRIFICATION
    ),
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
  data: SubmitElectrificationProjectDraftRequest,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required (a draft may already have one)
  if (!activityId) {
    const [activity, contacts] = await Promise.all([
      createActivity(
        { activity: repositories.activity, initiative: repositories.initiative },
        Initiative.ELECTRIFICATION
      ),
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
