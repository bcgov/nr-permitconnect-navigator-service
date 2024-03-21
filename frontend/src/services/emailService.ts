import { appAxios } from './interceptors';

// Do we need a separate type?
// import type { Note } from '@/types';

export default {
  /**
   * @function sendEmail
   * @returns {Promise} An axios response
   */
  async sendEmail(data: any) {
    // TODO: actual endpoint for sending emails via CHES
    return appAxios().put('insert/endpoint/here', data);
  }
};
