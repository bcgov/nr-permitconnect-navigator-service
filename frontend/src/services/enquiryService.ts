import { appAxios } from './interceptors';

export default {
  /**
   * @function createDraft
   * @returns {Promise} An axios response
   */
  createDraft(data?: any) {
    return appAxios().put('enquiry/draft', data);
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
  getEnquiries(self?: boolean) {
    return appAxios().get('enquiry', { params: { self } });
  },

  /**
   * @function getEnquiry
   * @returns {Promise} An axios response
   */
  getEnquiry(activityId: string) {
    return appAxios().get(`enquiry/${activityId}`);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(enquiryId: string, data?: any) {
    return appAxios().put(`enquiry/draft/${enquiryId}`, data);
  }
};
