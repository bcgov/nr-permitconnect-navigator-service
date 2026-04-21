import { Problem } from '../utils/index.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Project } from '../types/index.ts';

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
 * @param tx Prisma transaction client
 * @param activityId PCNS project Activity ID
 * @returns A Promise that resolves to the specific project
 */
export const getProjectByActivityId = async (tx: PrismaTransactionClient, activityId: string): Promise<Project> => {
  const [electrificationResult, generalResult, housingResult] = await Promise.all([
    tx.electrification_project.findFirst({
      where: { activityId },
      include: ACTIVITY_INCLUDE
    }),
    tx.general_project.findFirst({
      where: { activityId },
      include: ACTIVITY_INCLUDE
    }),
    tx.housing_project.findFirst({
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
 * @param tx Prisma transaction client
 * @param projectId PCNS project ID
 * @returns A Promise that resolves to the specific project
 */
export const getProjectByProjectId = async (tx: PrismaTransactionClient, projectId: string): Promise<Project> => {
  const [electrificationResult, generalResult, housingResult] = await Promise.all([
    tx.electrification_project.findFirst({
      where: { electrificationProjectId: projectId },
      include: ACTIVITY_INCLUDE
    }),
    tx.general_project.findFirst({
      where: { generalProjectId: projectId },
      include: ACTIVITY_INCLUDE
    }),
    tx.housing_project.findFirst({
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
