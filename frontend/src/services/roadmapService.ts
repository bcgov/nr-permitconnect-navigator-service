import { appAxios } from './interceptors';
import { useAppStore } from '@/store';
import { delimitEmails } from '@/utils/utils';

import type { GetRoadmapNoteRequest, NoteHistory, SendRoadmapRequest } from '@/types';

const PATH = 'roadmap';

/**
 * Retrieves the roadmap note for an activity.
 * @param req - The request payload containing the activity ID.
 * @returns A promise resolving to the roadmap note.
 */
export async function getRoadmapNote(req: GetRoadmapNoteRequest): Promise<string> {
  const { activityId } = req;

  const { data } = await appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/note`, {
    params: { activityId }
  });

  return data;
}

/**
 * Sends a roadmap email.
 * @param req - The request payload containing the activity ID, selected files, and email data.
 * @returns A promise resolving to the send result.
 */
export async function sendRoadmap(req: SendRoadmapRequest): Promise<NoteHistory> {
  const { activityId, selectedFileIds, emailData } = req;

  const normalizedEmailData = { ...emailData };

  if (normalizedEmailData.to && !Array.isArray(normalizedEmailData.to)) {
    normalizedEmailData.to = delimitEmails(normalizedEmailData.to);
  }

  if (normalizedEmailData.cc && !Array.isArray(normalizedEmailData.cc)) {
    normalizedEmailData.cc = delimitEmails(normalizedEmailData.cc);
  }

  if (!normalizedEmailData.cc) {
    normalizedEmailData.cc = [];
  }

  if (normalizedEmailData.bcc && !Array.isArray(normalizedEmailData.bcc)) {
    normalizedEmailData.bcc = delimitEmails(normalizedEmailData.bcc);
  }

  const { data } = await appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, {
    activityId,
    selectedFileIds,
    emailData: normalizedEmailData
  });

  return data;
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const roadmapService = {
  getRoadmapNote,
  sendRoadmap
};
