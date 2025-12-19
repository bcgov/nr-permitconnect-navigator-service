import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type { NoteHistory } from '@/types';

const PATH = 'note';

export default {
  /**
   * @function createNoteHistory
   * @returns {Promise} An axios response
   */
  createNoteHistory(data: NoteHistory & { note: string }) {
    return appAxios().post(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function deleteNoteHistory
   * @returns {Promise} An axios response
   */
  async deleteNoteHistory(noteHistoryId: string) {
    return appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${noteHistoryId}`);
  },

  /**
   * @function listBringForward
   * @returns {Promise} An axios response
   */
  async listBringForward(bringForwardState?: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/bringForward`, {
      params: { bringForwardState: bringForwardState }
    });
  },

  /**
   * @function listNoteHistories
   * @returns {Promise} An axios response
   */
  async listNoteHistories(activityId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/list/${activityId}`);
  },

  /**
   * @function updateNoteHistory
   * @returns {Promise} An axios response
   */
  async updateNoteHistory(noteHistoryId: string, data: NoteHistory & { note: string }) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${noteHistoryId}`, data);
  }
};
