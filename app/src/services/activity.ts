import prisma from '../db/dataConnection';
import { generateUniqueActivityId } from '../db/utils/utils';
import { IStamps } from '../interfaces/IStamps';
import { Activity } from '../types';
import { Initiative } from '../utils/enums/application';

/**
 * @function createActivity
 * Create an activity for the given initiative with a unique identifier
 * @param {string} initiative The initiative ID
 * @returns {Promise<Activity | null>} The result of running the findFirst operation
 */
export const createActivity = async (initiative: string, createStamp: Partial<IStamps>): Promise<Activity> => {
  const response = await prisma.$transaction(async (trx) => {
    const initiativeResult = await trx.initiative.findFirstOrThrow({ where: { code: initiative } });

    return await trx.activity.create({
      data: {
        activityId: await generateUniqueActivityId(),
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
 * @param {string} activityId Unique activity ID
 * @returns {Promise<Activity | null>} The result of running the findFirst operation
 */
export const deleteActivity = async (activityId: string): Promise<Activity> => {
  const response = await prisma.activity.delete({ where: { activityId } });

  return response;
};

/**
 * @function getActivity
 * Get an activity
 * @param {string} activityId Unique activity ID
 * @returns {Promise<Activity | null>} The result of running the findFirst operation
 */
export const getActivity = async (activityId: string): Promise<Activity> => {
  const response = await prisma.activity.findFirstOrThrow({ where: { activityId } });
  return response;
};

/**
 * @function getActivities
 * Get a list of activities
 * @param {string} [initiative] Optional initiative code, if provided, only return activities for that initiative
 * @returns {Promise<Activity[]>} The result of running the findMany operation
 */
export const getActivities = async (initiative?: Initiative): Promise<Activity[]> => {
  if (!initiative) {
    const allActivities = await prisma.activity.findMany({});
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
