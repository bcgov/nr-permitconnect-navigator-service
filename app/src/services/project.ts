import { Problem } from '../utils/index.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Project } from '../types/index.ts';

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
      include: {
        activity: {
          include: {
            activityContact: {
              include: { contact: true }
            },
            initiative: true
          }
        }
      }
    }),
    tx.general_project.findFirst({
      where: { activityId },
      include: {
        activity: {
          include: {
            activityContact: {
              include: { contact: true }
            },
            initiative: true
          }
        }
      }
    }),
    tx.housing_project.findFirst({
      where: { activityId },
      include: {
        activity: {
          include: {
            activityContact: {
              include: { contact: true }
            },
            initiative: true
          }
        }
      }
    })
  ]);

  if (electrificationResult && generalResult && housingResult) {
    throw new Problem(409, { detail: 'ActivityId exists in multiple projects.' });
  }

  if (electrificationResult) {
    return electrificationResult;
  }

  if (generalResult) {
    return generalResult;
  }

  if (housingResult) {
    return housingResult;
  }

  throw new Problem(404, { detail: 'No project found with given activityId.' });
};
