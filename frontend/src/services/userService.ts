import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { UserSearchParameters } from '@/types';

const PATH = 'user';

export default {
  /**
   * @function searchUsers
   * Returns a list of users based on the provided filtering parameters
   * @param {SearchUsersOptions} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  searchUsers(params: UserSearchParameters): Promise<AxiosResponse> {
    const userIds = params.userId;

    // Drop userId param if empty or assign back to params object, without duplicates
    if (userIds) {
      if (userIds.length === 0) {
        delete params.userId;
      } else {
        params.userId = Array.from(new Set(userIds));
      }
    }

    if (Object.keys(params).length) {
      return appAxios().get(`${PATH}`, { params: params });
    } else {
      return Promise.resolve({ data: [] } as AxiosResponse);
    }
  }
};
