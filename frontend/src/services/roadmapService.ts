import { appAxios } from './interceptors';

import { delimitEmails } from '@/utils/utils';

import type { Email } from '@/types';

export default {
  /**
   * @function send
   * Send an email with the roadmap data
   * @returns {Promise} An axios response
   */
  send(activityId: string, selectedFileIds: Array<string>, emailData: Email) {
    if (emailData.to && !Array.isArray(emailData.to)) {
      emailData.to = delimitEmails(emailData.to);
    }
    if (emailData.cc && !Array.isArray(emailData.cc)) {
      emailData.cc = delimitEmails(emailData.cc);
    }
    if (!emailData.cc) emailData.cc = [];
    if (emailData.bcc && !Array.isArray(emailData.bcc)) {
      emailData.bcc = delimitEmails(emailData.bcc);
    }

    return appAxios().put('roadmap', { activityId, selectedFileIds, emailData });
  }
};
