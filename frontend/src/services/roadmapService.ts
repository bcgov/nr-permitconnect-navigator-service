import { api } from './apiClient';
import { createInitiativeRouteBuilder } from './routeBuilder';
import { delimitEmails } from '@/utils/utils';

import type { ApiInitiative, Email, NoteHistory, QueryParams, RequestBody } from '@/types';
/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const roadmapRoute = createInitiativeRouteBuilder('roadmap');

const roadmapRoutes = {
  note: () => roadmapRoute('note'),
  root: () => roadmapRoute()
} as const;

/**
 * Retrieves the roadmap note for an activity.
 * @param req - The request payload containing the activity ID.
 * @returns A promise resolving to the roadmap note.
 */
export function getRoadmapNote(req: QueryParams<`get${ApiInitiative}RoadmapNote`>): Promise<string> {
  const { activityId } = req;

  return api.get<string>(roadmapRoutes.note(), {
    params: { activityId }
  });
}

/**
 * Sends a roadmap email.
 * @param req - The request payload containing the activity ID, selected files, and email data.
 * @returns A promise resolving to the send result.
 */
export function sendRoadmap(req: {
  activityId: string;
  selectedFileIds: string[];
  emailData: Email;
}): Promise<NoteHistory> {
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

  const body: RequestBody<`send${ApiInitiative}Roadmap`> = {
    activityId,
    selectedFileIds,
    emailData: normalizedEmailData
  };

  return api.post<NoteHistory>(roadmapRoutes.root(), body);
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
