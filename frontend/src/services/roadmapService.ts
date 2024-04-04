import { appAxios } from './interceptors';

import { parseCSV } from '@/utils/utils';

import type { Email } from '@/types';

export default {
  /**
   * @function send
   * Send an email with the roadmap data
   * @returns {Promise} An axios response
   */
  send(activityId: string, selectedFileIds: Array<string>, emailData: Email) {
    if (emailData.to && !Array.isArray(emailData.to)) {
      emailData.to = parseCSV(emailData.to);
    }
    if (emailData.cc && !Array.isArray(emailData.cc)) {
      emailData.cc = parseCSV(emailData.cc);
    }
    if (emailData.bcc && !Array.isArray(emailData.bcc)) {
      emailData.bcc = parseCSV(emailData.bcc);
    }

    return appAxios().put('roadmap', { activityId, selectedFileIds, emailData });
  }
};