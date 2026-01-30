import { appAxios } from './interceptors';
import { useAppStore } from '@/store';
import { delimitEmails } from '@/utils/utils';

import type { Email } from '@/types';

const PATH = 'roadmap';

export default {
  /**
   * @function send
   * Send an email with the roadmap data
   * @returns {Promise} An axios response
   */
  send(activityId: string, selectedFileIds: string[], emailData: Email) {
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

    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, {
      activityId,
      selectedFileIds,
      emailData
    });
  },

  getRoadmapNote(activityId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/note`, {
      params: { activityId }
    });
  }
};
