import prisma from '../db/dataConnection';

import { Initiative } from '../utils/enums/application';

const service = {
  /**
   * @function getInitiative
   * Create an activity for the given initiative with a unique identifier
   * @param {string} initiative The initiative code
   * @returns {Promise<Initiative | null>} The result of running the findFirstOrThrow operation
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
