import { v4 as uuidv4 } from 'uuid';

import { activityService } from '../../services/index.ts';
import { uuidToActivityId } from '../../utils/utils.ts';
import { CurrentContext } from '../../types/index.ts';

export function generateCreateStamps(currentContext: CurrentContext | undefined) {
  return {
    createdBy: currentContext?.userId,
    createdAt: new Date().toISOString()
  };
}

export function generateUpdateStamps(currentContext: CurrentContext | undefined) {
  return {
    updatedBy: currentContext?.userId,
    updatedAt: new Date().toISOString()
  };
}

/**
 * @function generateUniqueActivityId
 * Generate a new activityId, which are truncated UUIDs
 * If a collision is detected, generate new UUID and test again
 * @returns {Promise<string>} A string in title case
 */
export async function generateUniqueActivityId() {
  let id, queryResult;

  do {
    id = uuidToActivityId(uuidv4());
    queryResult = await activityService.getActivity(id);
  } while (queryResult);

  return id;
}
