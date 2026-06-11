import { api } from './apiClient';
import { createInitiativeRouteBuilder } from './routeBuilder';

import type {
  BringForward,
  CreateNoteHistoryRequest,
  DeleteNoteHistoryRequest,
  ListBringForwardsRequest,
  ListNoteHistoriesRequest,
  NoteHistory,
  PutNoteHistoryRequest
} from '@/types';
/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const noteRoute = createInitiativeRouteBuilder('note');

const noteRoutes = {
  root: () => noteRoute(),
  byId: (noteHistoryId: string) => noteRoute(noteHistoryId),

  bringForwards: () => noteRoute('bring-forward'),
  list: (activityId: string) => noteRoute('list', activityId)
} as const;

/**
 * Creates a note history record.
 * @param req - The request payload containing the note history data and note content.
 * @returns A promise resolving to the created `NoteHistory` resource.
 */
export function createNoteHistory(req: CreateNoteHistoryRequest): Promise<NoteHistory> {
  return api.post<NoteHistory>(noteRoutes.root(), req);
}

/**
 * Deletes a note history record.
 * @param req - The request payload containing the note history ID.
 * @returns A promise resolving to the deleted `NoteHistory` resource.
 */
export function deleteNoteHistory(req: DeleteNoteHistoryRequest): Promise<void> {
  const { noteHistoryId } = req;

  return api.delete(noteRoutes.byId(noteHistoryId));
}

/**
 * Retrieves all bring-forward records.
 * @param req - The request payload containing optional bring-forward filter criteria.
 * @returns A promise resolving to an array of `BringForward` resources.
 */
export function listBringForwards(req: ListBringForwardsRequest): Promise<BringForward[]> {
  const { bringForwardState } = req;

  return api.get<BringForward[]>(noteRoutes.bringForwards(), {
    params: { bringForwardState }
  });
}

/**
 * Retrieves all note history records associated with an activity.
 * @param req - The request payload containing the activity ID.
 * @returns A promise resolving to an array of `NoteHistory` resources.
 */
export function listNoteHistories(req: ListNoteHistoriesRequest): Promise<NoteHistory[]> {
  const { activityId } = req;

  return api.get<NoteHistory[]>(noteRoutes.list(activityId));
}

/**
 * Updates a note history record.
 * @param req - The request payload containing the note history ID and updated fields.
 * @returns A promise resolving to the updated `NoteHistory` resource.
 */
export function putNoteHistory(req: PutNoteHistoryRequest): Promise<NoteHistory> {
  const { noteHistoryId, ...body } = req;

  return api.put<NoteHistory>(noteRoutes.byId(noteHistoryId), body);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const noteHistoryService = {
  createNoteHistory,
  deleteNoteHistory,
  listBringForwards,
  listNoteHistories,
  putNoteHistory
};
