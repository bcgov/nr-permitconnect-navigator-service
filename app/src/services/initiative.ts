import prisma from '../db/dataConnection.ts';

import { Initiative } from '../utils/enums/application.ts';

const service = {
  /**
   * @function getInitiative
   * Create an activity for the given initiative with a unique identifier
   * @param {string} initiative The initiative ID
   * @returns {Promise<Activity | null>} The result of running the findFirst operation
   */
  getInitiative: async (initiative: Initiative) => {
    const result = await prisma.initiative.findFirstOrThrow({
      where: {
        code: initiative
      }
    });
    return { initiativeId: result.initiative_id, code: result.code, label: result.label };
  }
};

export default service;
