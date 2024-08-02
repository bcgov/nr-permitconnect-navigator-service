import { appAxios } from './interceptors';

export default {
  /**
   * @function checkActivityIdValidity
   * Checks if an activity ID is valid
   * @returns {Promise} An axios response
   */
  checkActivityIdValidity(activityId: string) {
    return appAxios().get(`activity/validate/${activityId}`);
  }
};
