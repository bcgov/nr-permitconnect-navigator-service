import { appAxios } from './interceptors';

export default {
  /**
   * @function update
   *
   * updates roadmap for an activity
   * @returns {Promise} An axios response
   */
  update(activityId: string, emailData: any) {
    return appAxios().put('roadmap', { activityId, emailData });
  }
};
