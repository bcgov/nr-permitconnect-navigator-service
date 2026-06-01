import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type {
  BringForward,
  CreateNoteHistoryRequest,
  DeleteNoteHistoryRequest,
  ListBringForwardsRequest,
  ListNoteHistoriesRequest,
  NoteHistory,
  PutNoteHistoryRequest
} from '@/types';

const PATH = 'note';
/**
 * Creates a note history record.
 * @param req - The request payload containing the note history data and note content.
 * @returns A promise resolving to the created `NoteHistory` resource.
 */
export async function createNoteHistory(req: CreateNoteHistoryRequest): Promise<NoteHistory> {
  const { data } = await appAxios().post<NoteHistory>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, req);

  return data;
}

/**
 * Deletes a note history record.
 * @param req - The request payload containing the note history ID.
 * @returns A promise resolving to the deleted `NoteHistory` resource.
 */
export async function deleteNoteHistory(req: DeleteNoteHistoryRequest): Promise<NoteHistory> {
  const { noteHistoryId } = req;

  const { data } = await appAxios().delete<NoteHistory>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/${noteHistoryId}`
  );

  return data;
}

/**
 * Retrieves all bring-forward records.
 * @param req - The request payload containing optional bring-forward filter criteria.
 * @returns A promise resolving to an array of `BringForward` resources.
 */
export async function listBringForwards(req: ListBringForwardsRequest): Promise<BringForward[]> {
  const { bringForwardState } = req;

  const { data } = await appAxios().get<BringForward[]>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/bringForward`,
    {
      params: { bringForwardState }
    }
  );

  return data;
}

/**
 * Retrieves all note history records associated with an activity.
 * @param req - The request payload containing the activity ID.
 * @returns A promise resolving to an array of `NoteHistory` resources.
 */
export async function listNoteHistories(req: ListNoteHistoriesRequest): Promise<NoteHistory[]> {
  const { activityId } = req;

  const { data } = await appAxios().get<NoteHistory[]>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/list/${activityId}`
  );

  return data;
}

/**
 * Updates a note history record.
 * @param req - The request payload containing the note history ID and updated fields.
 * @returns A promise resolving to the updated `NoteHistory` resource.
 */
export async function putNoteHistory(req: PutNoteHistoryRequest): Promise<NoteHistory> {
  const { noteHistoryId, ...body } = req;

  const { data } = await appAxios().put<NoteHistory>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/${noteHistoryId}`,
    body
  );

  return data;
}

/** Hybrid default export object for backward compatibility */
const noteHistoryService = {
  createNoteHistory,
  deleteNoteHistory,
  listBringForwards,
  listNoteHistories,
  putNoteHistory
};

export default noteHistoryService;
