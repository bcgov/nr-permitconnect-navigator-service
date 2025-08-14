import prisma from '../db/dataConnection';
import { generateUniqueActivityId } from '../db/utils/utils';
import { Initiative } from '../utils/enums/application';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { IStamps } from '../interfaces/IStamps';
import type { Activity } from '../types';

/**
 * @function createActivity
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
  // TODO-PR: Rewrite service call to only call one service, move initiative search up to controller layer.
  const response = await prisma.$transaction(async (trx) => {
    const initiativeResult = await trx.initiative.findFirstOrThrow({ where: { code: initiative } });

    return await trx.activity.create({
      data: {
        activityId: await generateUniqueActivityId(trx),
        initiativeId: initiativeResult.initiativeId,
        createdAt: createStamp.createdAt,
        createdBy: createStamp.createdBy
      }
    });
  });

  return response;
};

/**
 * @function deleteActivity
 * Delete an activity
 * This action will cascade delete across all linked items
 * @param tx Prisma transaction client
 * @param activityId Unique activity ID
 */
export const deleteActivity = async (tx: PrismaTransactionClient, activityId: string): Promise<void> => {
  await tx.activity.delete({ where: { activityId } });
};

/**
 * @function getActivity
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
 * @function getActivities
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
