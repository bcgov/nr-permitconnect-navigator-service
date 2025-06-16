import prisma from '../db/dataConnection';
import { generateUniqueActivityId } from '../db/utils/utils';
import { IStamps } from '../interfaces/IStamps';
import { Activity } from '../types';
import { Initiative } from '../utils/enums/application';

const service = {
  /**
   * @function createActivity
   * Create an activity for the given initiative with a unique identifier
   * @param {string} initiative The initiative ID
   * @returns {Promise<Activity | null>} The result of running the findFirst operation
   */
  createActivity: async (initiative: string, createStamp: Partial<IStamps>) => {
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
  },

  /**
   * @function deleteActivity
   * Delete an activity
   * This action will cascade delete across all linked items
   * @param {string} activityId Unique activity ID
   * @returns {Promise<Activity | null>} The result of running the findFirst operation
   */
  deleteActivity: async (activityId: string) => {
    const response = await prisma.activity.delete({ where: { activityId } });

    return response;
  },

  /**
   * @function getActivity
   * Get an activity
   * @param {string} activityId Unique activity ID
   * @returns {Promise<Activity | null>} The result of running the findFirst operation
   */
  getActivity: async (activityId: string) => {
    const response = await prisma.activity.findFirst({ where: { activityId } });

    return response ?? null;
  },

  /**
   * @function getActivities
   * Get a list of activities
   * @param {string} [initiative] Optional initiative code, if provided, only return activities for that initiative
   * @param {boolean} [includeDeleted=false] Optional flag to include deleted activities
   * @returns {Promise<Activity[]>} The result of running the findMany operation
   */
  getActivities: async (includeDeleted: boolean = false, initiative?: Initiative): Promise<Activity[]> => {
    if (!initiative) {
      const allActivities = await prisma.activity.findMany({
        where: { isDeleted: includeDeleted ? undefined : false }
      });
      return allActivities;
    } else {
      const response = await prisma.activity.findMany({
        where: {
          isDeleted: includeDeleted ? undefined : false,
          initiative: {
            code: initiative
          }
        }
      });
      return response;
    }
  }
};

export default service;
