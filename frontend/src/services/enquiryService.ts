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
  deleteEnquiry(enquiryId: string, hardDelete?: boolean) {
    return appAxios().delete('enquiry', { params: { enquiryId, hardDelete } });
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
  getEnquiry(enquiryId: string) {
    return appAxios().get(`enquiry/${enquiryId}`);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(enquiryId: string, data?: any) {
    return appAxios().put(`enquiry/draft/${enquiryId}`, data);
  },

  /**
   * @function updateEnquiry
   * @returns {Promise} An axios response
   */
  updateEnquiry(enquiryId: string, data?: any) {
    return appAxios().put(`enquiry/${enquiryId}`, data);
  }
};
