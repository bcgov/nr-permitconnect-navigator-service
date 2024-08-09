import prisma from '../db/dataConnection';
import { activity } from '../db/models';
import { generateUniqueActivityId } from '../db/utils/utils';
import { IStamps } from '../interfaces/IStamps';

const service = {
  /**
   * @function createActivity
   * Create an activity for the given initiative with a unique identifier
   * @param {string} initiative The initiative ID
   * @returns {Promise<Activity | null>} The result of running the findFirst operation
   */
  createActivity: async (initiative: string, createStamp: Partial<IStamps>) => {
    const response = await prisma.$transaction(async (trx) => {
      const initiativeResult = await trx.initiative.findFirstOrThrow({
        where: {
          code: initiative
        }
      });

      return await trx.activity.create({
        data: {
          activity_id: await generateUniqueActivityId(),
          initiative_id: initiativeResult.initiative_id,
          created_at: createStamp.createdAt,
          created_by: createStamp.createdBy
        }
      });
    });

    return activity.fromPrismaModel(response);
  },

  /**
   * @function deleteActivity
   * Delete an activity
   * This action will cascade delete across all linked items
   * @param {string} activityId Unique activity ID
   * @returns {Promise<Activity | null>} The result of running the findFirst operation
   */
  deleteActivity: async (activityId: string) => {
    const response = await prisma.activity.delete({
      where: {
        activity_id: activityId
      }
    });

    return activity.fromPrismaModel(response);
  },

  /**
   * @function getActivity
   * Get an activity
   * @param {string} activityId Unique activity ID
   * @returns {Promise<Activity | null>} The result of running the findFirst operation
   */
  getActivity: async (activityId: string) => {
    const response = await prisma.activity.findFirst({
      where: {
        activity_id: activityId
      }
    });

    return activity.fromPrismaModel(response);
  }
};

export default service;
