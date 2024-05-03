import { v4 as uuidv4 } from 'uuid';

import { activityService } from '../../services';
import { uuidToActivityId } from '../../components/utils';
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
