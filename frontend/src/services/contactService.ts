import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { Contact, ContactSearchParameters } from '@/types';

const PATH = 'contact';

export default {
  /**
   * @function getContact
   * Returns a specific contact details
   * @returns {Promise<AxiosResponse>} An axios response or empty object
   */
  getContact(contactId: string, includeActivities = false): Promise<AxiosResponse<Contact>> {
    return appAxios().get(`${PATH}/${contactId}`, { params: { includeActivities } });
  },

  /**
   * @function getCurrentUserContact
   * Returns current user's contact details
   * @returns {Promise<AxiosResponse>} An axios response or empty object
   */
  getCurrentUserContact(): Promise<AxiosResponse<Contact>> {
    return appAxios().get(`${PATH}`);
  },

  /**
   * @function deleteContact
   * Deletes a specific contact
   * @param contactId
   * @returns An axios response
   */
  deleteContact(contactId: string): Promise<AxiosResponse<Contact>> {
    return appAxios().delete(`${PATH}/${contactId}`);
  },

  /**
   * @function matchContacts
   * Returns a list of contacts if any of the provided filtering parameters match
   * @param {ContactSearchParameters} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  matchContacts(data: ContactSearchParameters): Promise<AxiosResponse<Contact[]>> {
    return appAxios().post(`${PATH}/match`, data);
  },

  /**
   * @function searchContacts
   * Returns a list of users based on the provided filtering parameters
   * @param {SearchUsersOptions} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  searchContacts(params: ContactSearchParameters): Promise<AxiosResponse<Contact[]>> {
    return appAxios().post(`${PATH}/search`, params);
  },

  /**
   * @function updateContact
   * @returns {Promise} An axios response
   */
  updateContact(data?: Contact): Promise<AxiosResponse<Contact>> {
    return appAxios().put(`${PATH}`, data);
  }
};
