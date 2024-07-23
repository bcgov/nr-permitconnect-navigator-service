import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';

const PATH = 'yars';

export default {
  getPermissions(): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/permissions`);
  }
};
