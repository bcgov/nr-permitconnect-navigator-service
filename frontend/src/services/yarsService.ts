import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { Initiative } from '@/utils/enums/application';

const PATH = 'yars';

export default {
  getGroups(initiative: Initiative): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/groups`, { params: { initiative } });
  },

  getPermissions(): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/permissions`);
  },

  deleteSubjectGroup(sub: string, groupId: number): Promise<AxiosResponse> {
    return appAxios().delete(`${PATH}/subject/group`, { data: { sub, groupId } });
  }
};
