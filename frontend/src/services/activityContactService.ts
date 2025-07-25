import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { Contact } from '@/types';

const PATH = 'activityContact';

export default {
  /**
   * @function updateActivityContact
   * @returns {Promise} An axios response
   */
  updateActivityContact(activityId: string, contacts: Contact[]): Promise<AxiosResponse<Contact>> {
    return appAxios().post(`${PATH}`, { activityId, contacts });
  }
};
