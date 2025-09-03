import { appAxios } from './interceptors';

import type { ATSClientResource, ATSEnquiryResource } from '@/types';

export default {
  /**
   * Searches for ATS users
   * @param params The search parameters
   * @returns {Promise} An axios response
   */

  searchATSUsers(params?: any) {
    return appAxios().get('ats/clients', { params: params });
  },

  /**
   * Create a client resource in ATS
   * @param data ATS client resource to create
   * @returns {Promise} An axios response
   */
  createATSClient(data?: ATSClientResource) {
    return appAxios().post('ats/client', data);
  },

  /**
   * Create an enquiry resource in ATS
   * @param data ATS enquiry resource to create
   * @returns {Promise} An axios response
   */
  createATSEnquiry(data?: ATSEnquiryResource) {
    return appAxios().post('ats/enquiry', data);
  }
};
