import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { ContactSearchParameters } from '@/types';

const PATH = 'contact';

export default {
  /**
   * @function getContact
   * Returns a specific contact details
   * @returns {Promise<AxiosResponse>} An axios response or empty object
   */
  getContact(contactId: string, includeActivities: boolean = false): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/${contactId}`, { params: { includeActivities } });
  },

  /**
   * @function getCurrentUserContact
   * Returns current user's contact details
   * @returns {Promise<AxiosResponse>} An axios response or empty object
   */
  getCurrentUserContact(): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}`);
  },

  /**
   * @function deleteContact
   * Deletes a specific contact
   * @param contactId
   * @returns An axios response
   */
  deleteContact(contactId: string): Promise<AxiosResponse> {
    return appAxios().delete(`${PATH}/${contactId}`);
  },

  /**
   * @function matchContacts
   * Returns a list of contacts if any of the provided filtering parameters match
   * @param {MatchContactsOptions} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  matchContacts(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }): Promise<AxiosResponse> {
    return appAxios().get(`${PATH}/match`, { params: params });
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
