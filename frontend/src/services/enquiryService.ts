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
   * @function updateDraft
   * @returns {Promise} An axios response
   */
  updateDraft(enquiryId: string, data?: any) {
    return appAxios().put(`enquiry/draft/${enquiryId}`, data);
  }
};
