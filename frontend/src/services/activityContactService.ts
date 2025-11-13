import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { ActivityContact } from '@/types';

export default {
  createActivityContact(activityId: string, contactId: string, role: string): Promise<AxiosResponse<ActivityContact>> {
    return appAxios().post(`activity/${activityId}/contact/${contactId}`, { role });
  },

  /**
   * @function listActivityContacts
   * @returns {Promise} An axios response
   */
  listActivityContacts(activityId: string): Promise<AxiosResponse<ActivityContact[]>> {
    return appAxios().get(`activity/${activityId}/contact`, { activityId });
  }
};
