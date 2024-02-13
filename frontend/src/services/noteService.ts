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
   * @function listNotes
   * @returns {Promise} An axios response
   */
  async listNotes(submissionId: string) {
    return appAxios().get(`note/list/${submissionId}`);
  }
};
