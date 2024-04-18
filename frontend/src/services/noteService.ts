import { appAxios } from './interceptors';

import type { Note } from '@/types';

export default {
  /**
   * @function createNote
   * @returns {Promise} An axios response
   */
  createNote(data: Note) {
    return appAxios().put('note', data);
  },

  /**
   * @function deleteNote
   * @returns {Promise} An axios response
   */
  async deleteNote(noteId: string) {
    return appAxios().delete(`note/${noteId}`);
  },

  /**
   * @function listBringForward
   * @returns {Promise} An axios response
   */
  async listBringForward(bringForwardState?: string) {
    return appAxios().get('note/bringForward', { params: { bringForwardState: bringForwardState } });
  },

  /**
   * @function listNotes
   * @returns {Promise} An axios response
   */
  async listNotes(activityId: string) {
    return appAxios().get(`note/list/${activityId}`);
  },

  /**
   * @function updateNote
   * @returns {Promise} An axios response
   */
  async updateNote(note: Note) {
    return appAxios().put(`note/${note.noteId}`, note);
  }
};
