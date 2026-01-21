import { appAxios } from './interceptors';

import type { CancelToken } from 'axios';
import type { BceidSearchParameters, IdirSearchParameters } from '@/types';

export default {
  searchIdirUsers(params?: IdirSearchParameters, cancelToken?: CancelToken) {
    return appAxios().get('sso/idir/users', { params: params, cancelToken: cancelToken });
  },

  searchBasicBceidUsers(params?: BceidSearchParameters) {
    return appAxios().get('sso/basic-bceid/users', { params: params });
  },

  searchBusinessBceidUsers(params?: BceidSearchParameters) {
    return appAxios().get('sso/business-bceid/users', { params: params });
  }
};
