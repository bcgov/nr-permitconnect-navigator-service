import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';

const PATH = 'yars';

export default {
  getGroups(): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/groups`);
  },

  getPermissions(): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/permissions`);
  }
};
