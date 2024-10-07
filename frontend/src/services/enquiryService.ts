import { appAxios } from './interceptors';

export default {
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
   * @function submitDraft
   * @returns {Promise} An axios response
   */
  submitDraft(data?: any) {
    return appAxios().put('enquiry/draft/submit', data);
  },

  /**
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(data?: any) {
    return appAxios().put('enquiry/draft', data);
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
