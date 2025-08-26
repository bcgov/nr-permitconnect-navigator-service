import prisma from '../db/dataConnection';
import { generateUniqueActivityId } from '../db/utils/utils';
import { Initiative } from '../utils/enums/application';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { IStamps } from '../interfaces/IStamps';
import type { Activity } from '../types';

/**
 * Create an activity for the given initiative with a unique identifier
 * @param tx Prisma transaction client
 * @param initiative The initiative ID
 * @param createStamp The creation stamps
 * @returns The result of running the findFirst operation
 */
export const createActivity = async (
  tx: PrismaTransactionClient,
  initiative: string,
  createStamp: Partial<IStamps>
): Promise<Activity> => {
  // TODO-PR: Move initiative search up to controller layer.
  const initiativeResult = await tx.initiative.findFirstOrThrow({ where: { code: initiative } });

  const response = await tx.activity.create({
    data: {
      activityId: await generateUniqueActivityId(tx),
      initiativeId: initiativeResult.initiativeId,
      createdAt: createStamp.createdAt,
      createdBy: createStamp.createdBy
    }
  });

  return response;
};

/**
 * Delete an activity
 * @param tx Prisma transaction client
 * @param activityId Unique activity ID
 * @param deleteStamp Timestamp information of the delete
 */
export const deleteActivity = async (
  tx: PrismaTransactionClient,
  activityId: string,
  deleteStamp: Partial<IStamps>
): Promise<void> => {
  await tx.activity.update({
    data: { isDeleted: true, updatedAt: deleteStamp.updatedAt, updatedBy: deleteStamp.updatedBy },
    where: { activityId }
  });
};

/**
 * Get an activity
 * @param tx Prisma transaction client
 * @param activityId Unique activity ID
 * @returns The result of running the findFirst operation
 */
export const getActivity = async (tx: PrismaTransactionClient, activityId: string): Promise<Activity> => {
  const response = await tx.activity.findFirstOrThrow({ where: { activityId } });
  return response;
};

/**
 * Get a list of activities
 * @param tx Prisma transaction client
 * @param initiative Optional initiative code, if provided, only return activities for that initiative
 * @returns {Promise<Activity[]>} The result of running the findMany operation
 */
export const getActivities = async (tx: PrismaTransactionClient, initiative?: Initiative): Promise<Activity[]> => {
  if (!initiative) {
    const allActivities = await tx.activity.findMany({});
    return allActivities;
  } else {
    const response = await prisma.activity.findMany({
      where: {
        initiative: {
          code: initiative
        }
      }
    });
    return response;
  }
};
