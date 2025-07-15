import prisma from '../db/dataConnection';

import { Initiative as EInitiative } from '../utils/enums/application';

import type { Initiative } from '../types';

/**
 * @function getInitiative
 * Create an activity for the given initiative with a unique identifier
 * @param {string} initiative The initiative code
 * @returns {Promise<Initiative | null>} The result of running the findFirstOrThrow operation
 */
export const getInitiative = async (initiative: EInitiative): Promise<Initiative> => {
  const result = await prisma.initiative.findFirstOrThrow({
    where: {
      code: initiative
    }
  });
  return result;
};
