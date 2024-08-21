import { appAxios } from './interceptors';

import type { CancelToken } from 'axios';

export default {
  searchIdirUsers(params?: any, cancelToken?: CancelToken) {
    return appAxios().get('sso/idir/users', { params: params, cancelToken: cancelToken });
  },

  searchBasicBceidUsers(params?: any) {
    return appAxios().get('sso/basic-bceid/users', { params: params });
  }
};
