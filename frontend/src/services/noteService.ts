import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type { Note } from '@/types';

const PATH = 'note';

export default {
  /**
   * @function createNote
   * @returns {Promise} An axios response
   */
  createNote(data: Note) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function deleteNote
   * @returns {Promise} An axios response
   */
  async deleteNote(noteId: string) {
    return appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${noteId}`);
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
   * @function listNotes
   * @returns {Promise} An axios response
   */
  async listNotes(activityId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/list/${activityId}`);
  },

  /**
   * @function updateNote
   * @returns {Promise} An axios response
   */
  async updateNote(note: Note) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${note.noteId}`, note);
  }
};
