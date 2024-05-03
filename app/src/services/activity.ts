import prisma from '../db/dataConnection';
import { activity } from '../db/models';

const service = {
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
