import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { ActivityContact, Contact } from '@/types';

const PATH = 'activityContact';

export default {
  createActivityContact(activityId: string, contactId: string, role: string): Promise<AxiosResponse<ActivityContact>> {
    return appAxios().post(`activity/${activityId}/contact/${contactId}`, { role });
  },

  /**
   * @function updateActivityContact
   * @returns {Promise} An axios response
   */
  updateActivityContact(activityId: string, contacts: Contact[]): Promise<AxiosResponse<Contact>> {
    return appAxios().post(`${PATH}`, { activityId, contacts });
  }
};
