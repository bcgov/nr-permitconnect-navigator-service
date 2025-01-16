import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { ContactSearchParameters } from '@/types';

const PATH = 'contact';

export default {
  /**
   * @function getCurrentUserContact
   * Returns current user's contact details
   * @returns {Promise<AxiosResponse>} An axios response or empty object
   */
  getCurrentUserContact(): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/`);
  },
  /**
   * @function searchContacts
   * Returns a list of users based on the provided filtering parameters
   * @param {SearchUsersOptions} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  searchContacts(params: ContactSearchParameters): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/search`, { params: params });
  },
  /**
   * @function updateEnquiry
   * @returns {Promise} An axios response
   */
  updateContact(data?: any) {
    return appAxios().put(`${PATH}/${data.contactId}`, data);
  }
};
