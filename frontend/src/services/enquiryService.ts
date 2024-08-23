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
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(enquiryId: string, data?: any) {
    return appAxios().put(`enquiry/draft/${enquiryId}`, data);
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
