import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { ActivityContact } from '@/types';

export default {
  /**
   * @function listActivityContacts
   * @returns {Promise} An axios response
   */
  createActivityContact(activityId: string, contactId: string, role: string): Promise<AxiosResponse<ActivityContact>> {
    return appAxios().post(`activity/${activityId}/contact/${contactId}`, { role });
  },

  /**
   * @function deleteActivityContacts
   * @returns {Promise} An axios response
   */
  deleteActivityContact(activityId: string, contactId: string): Promise<AxiosResponse<ActivityContact>> {
    return appAxios().delete(`activity/${activityId}/contact/${contactId}`);
  },

  /**
   * @function listActivityContacts
   * @returns {Promise} An axios response
   */
  listActivityContacts(activityId: string): Promise<AxiosResponse<ActivityContact[]>> {
    return appAxios().get(`activity/${activityId}/contact`);
  },

  /**
   * @function updateActivityContact
   * @returns {Promise} An axios response
   */
  updateActivityContact(activityId: string, contactId: string, role: string): Promise<AxiosResponse<ActivityContact>> {
    return appAxios().put(`activity/${activityId}/contact/${contactId}`, { role });
  }
};
