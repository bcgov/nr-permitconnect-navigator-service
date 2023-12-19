import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { UserSearchParameters } from '@/types';

import { SYSTEM_USER } from '@/utils/constants';

const PATH = 'user';

export default {
  /**
   * @function searchUsers
   * Returns a list of users based on the provided filtering parameters
   * @param {SearchUsersOptions} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  searchUsers(params: UserSearchParameters): Promise<AxiosResponse> {
    // Filter out SYSTEM_USER from userId param
    const userIds = params.userId?.filter((id: string | undefined) => id !== undefined && id !== SYSTEM_USER);
    // Drop userId param if it only contains the system user or assign back to params object, without duplicates
    if (userIds) {
      if (userIds.length === 0) {
        delete params.userId;
      } else {
        params.userId = [...new Set(userIds)];
      }
    }

    if (Object.keys(params).length) {
      return appAxios().get(`${PATH}`, { params: params });
    } else {
      return Promise.resolve({ data: [] } as AxiosResponse);
    }
  }
};
