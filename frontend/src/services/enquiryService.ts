import { appAxios } from './interceptors';

import type { EnquirySearchParameters } from '@/types';

export default {
  /**
   * @function createEnquiry
   * @returns {Promise} An axios response
   */
  createEnquiry(data?: any) {
    return appAxios().put('enquiry', data);
  },

  /**
   * @function deleteEnquiry
   * @returns {Promise} An axios response
   */
  deleteEnquiry(enquiryId: string) {
    return appAxios().delete(`enquiry/${enquiryId}`);
  },

  /**
   * @function getEnquiries
   * @returns {Promise} An axios response
   */
  getEnquiries() {
    return appAxios().get('enquiry');
  },

  /**
   * @function getEnquiry
   * @returns {Promise} An axios response
   */
  getEnquiry(enquiryId: string) {
    return appAxios().get(`enquiry/${enquiryId}`);
  },

  /**
   * @function listRelatedEnquiries
   * @param {string} activityId
   * @description List all enquiries related to an activity
   * @returns {Promise} An axios response
   */
  async listRelatedEnquiries(activityId: string) {
    return appAxios().get(`enquiry/list/${activityId}`);
  },

  /**
   * @function searchEnquiries
   * @returns {Promise} An axios response
   */
  searchEnquiries(filters?: EnquirySearchParameters) {
    return appAxios().get('enquiry/search', { params: { ...filters } });
  },

  /**
   * @function updateIsDeletedFlag
   * @returns {Promise} An axios response
   */
  updateIsDeletedFlag(enquiryId: string, isDeleted: boolean) {
    return appAxios().patch(`enquiry/${enquiryId}/delete`, { isDeleted: isDeleted });
  },

  /**
   * @function updateEnquiry
   * @returns {Promise} An axios response
   */
  updateEnquiry(enquiryId: string, data?: any) {
    return appAxios().put(`enquiry/${enquiryId}`, data);
  }
};
