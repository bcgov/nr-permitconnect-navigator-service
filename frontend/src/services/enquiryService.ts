import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type { Enquiry, EnquirySearchParameters } from '@/types';
import type { EnquiryArgs } from '@/types/Enquiry';

const PATH = 'enquiry';

export default {
  /**
   * @function createEnquiry
   * @returns {Promise} An axios response
   */
  createEnquiry(data: EnquiryArgs) {
    return appAxios().post(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function deleteEnquiry
   * @returns {Promise} An axios response
   */
  deleteEnquiry(enquiryId: string) {
    return appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${enquiryId}`);
  },

  /**
   * @function getEnquiries
   * @returns {Promise} An axios response
   */
  getEnquiries() {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`);
  },

  /**
   * @function getEnquiry
   * @returns {Promise} An axios response
   */
  getEnquiry(enquiryId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${enquiryId}`);
  },

  /**
   * @function listRelatedEnquiries
   * @param {string} activityId
   * @description List all enquiries related to an activity
   * @returns {Promise} An axios response
   */
  async listRelatedEnquiries(activityId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/list/${activityId}`);
  },

  /**
   * @function searchEnquiries
   * @returns {Promise} An axios response
   */
  searchEnquiries(filters?: EnquirySearchParameters) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/search`, { params: { ...filters } });
  },

  /**
   * @function updateEnquiry
   * @returns {Promise} An axios response
   */
  updateEnquiry(enquiryId: string, data?: Enquiry) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${enquiryId}`, data);
  }
};
