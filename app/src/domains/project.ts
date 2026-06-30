import { Repositories } from '../repository/unitOfWork.ts';
import { Problem } from '../utils/index.ts';

import type { Project } from '../types';

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
 * Gets a specific project from the PCNS database by given ActivityId
 * @param repositories - The required repositories
 * @param activityId - PCNS project Activity ID
 * @returns A Promise that resolves to the specific project
 */
export const getProjectByActivityId = async (
  repositories: Pick<Repositories, 'electrificationProject' | 'generalProject' | 'housingProject'>,
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
  repositories: Pick<Repositories, 'electrificationProject' | 'generalProject' | 'housingProject'>,
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
