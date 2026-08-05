import config from 'config';

import { email } from '../external/ches.ts';
import { Problem, toTitleCase } from '../utils/index.ts';
import getLogger from '../utils/log.ts';

import type { Repositories } from '../db/unitOfWork';
import type { Contact, Project, ProjectRepositoryKeys } from '../types';
import type { Initiative } from '../utils/enums/application.ts';
import type { EmailTemplate } from '../utils/templates.ts';

const log = getLogger(module.filename);

/**
 * Helper object for prisma include
 */
const ACTIVITY_INCLUDE = {
  activity: {
    include: {
      activityContact: {
        include: { contact: true }
      },
      initiative: true
    }
  }
};

/**
 * Generates and sends a templated email with the given data
 * @param initiative - Initiative of the project
 * @param activityId - Activity ID of the project
 * @param projectId - ID assigned to the project
 * @param template - Email template function to use
 * @param contact - Primary contact of the project
 */
export async function emailProjectConfirmation(
  initiative: Initiative,
  activityId: string,
  projectId: string,
  template: EmailTemplate,
  contact: Contact
) {
  if (!contact.email) {
    log.warn('Contact has no email. Cannot send project confirmation email.', {
      activityId,
      projectId
    });
    return;
  }

  const configCC = config.get<string>('server.ches.submission.cc');
  const initiativeTitle = toTitleCase(initiative);
  const subject = `Confirmation of ${initiativeTitle} Project Submission`;

  const body = template({
    contactName: contact?.firstName && contact?.lastName ? `${contact?.firstName} ${contact?.lastName}` : '',
    initiative: initiativeTitle,
    activityId,
    projectId
  });

  const emailData = {
    from: configCC,
    to: [contact.email],
    cc: [configCC],
    subject,
    bodyType: 'html',
    body
  };

  await email(emailData);
}

/**
 * Gets a specific project from the PCNS database by given ActivityId
 * @param repositories - The required repositories
 * @param activityId - PCNS project Activity ID
 * @returns A Promise that resolves to the specific project
 */
export const getProjectByActivityId = async (
  repositories: Pick<Repositories, ProjectRepositoryKeys>,
  activityId: string
): Promise<Project> => {
  const [electrificationResult, generalResult, housingResult] = await Promise.all([
    repositories.electrificationProject.findFirst({
      where: { activityId },
      include: ACTIVITY_INCLUDE
    }),
    repositories.generalProject.findFirst({
      where: { activityId },
      include: ACTIVITY_INCLUDE
    }),
    repositories.housingProject.findFirst({
      where: { activityId },
      include: ACTIVITY_INCLUDE
    })
  ]);

  const results = [electrificationResult, generalResult, housingResult].filter(Boolean);

  if (results.length >= 2) {
    throw new Problem(409, { detail: 'Activity Id exists in multiple projects.' });
  }

  if (results[0]) {
    return results[0];
  }

  throw new Problem(404, { detail: 'No project found with given activity Id.' });
};

/**
 * Gets a specific project from the PCNS database by given projectId
 * @param repositories - The required repositories
 * @param projectId - PCNS project ID
 * @returns A Promise that resolves to the specific project
 */
export const getProjectByProjectId = async (
  repositories: Pick<Repositories, ProjectRepositoryKeys>,
  projectId: string
): Promise<Project> => {
  const [electrificationResult, generalResult, housingResult] = await Promise.all([
    repositories.electrificationProject.findFirst({
      where: { electrificationProjectId: projectId },
      include: ACTIVITY_INCLUDE
    }),
    repositories.generalProject.findFirst({
      where: { generalProjectId: projectId },
      include: ACTIVITY_INCLUDE
    }),
    repositories.housingProject.findFirst({
      where: { housingProjectId: projectId },
      include: ACTIVITY_INCLUDE
    })
  ]);

  const results = [electrificationResult, generalResult, housingResult].filter(Boolean);

  if (results.length >= 2) {
    throw new Problem(409, { detail: 'Project Id exists in multiple projects.' });
  }

  if (results[0]) {
    return results[0];
  }

  throw new Problem(404, { detail: 'No project found with given project Id.' });
};
