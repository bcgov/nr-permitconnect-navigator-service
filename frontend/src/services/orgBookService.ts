import { appAxios } from './interceptors';

import type { AxiosResponse } from 'axios';

import { ORG_BOOK_API_URL } from '@/utils/constants';

export default {
  /**
   * @function searchOrgBook
   * Calls OrgBook API to search for company names
   * @param {string} nameSearch SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  searchOrgBook(nameSearch: string): Promise<AxiosResponse> {
    return appAxios().get(`${ORG_BOOK_API_URL}`, { params: { q: nameSearch } });
  }
};
