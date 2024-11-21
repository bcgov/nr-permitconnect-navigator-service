import { appAxios } from './interceptors';

import type { PermitNote } from '@/types';

export default {
  /**
   * @function createPermitNote
   * @returns {Promise} An axios response
   */
  createPermitNote(data: Partial<PermitNote>) {
    return appAxios().put('permit/note', data);
  },

  /**
   * @function deletePermitNote
   * @returns {Promise} An axios response
   */
  deletePermitNote(permitNoteId: string) {
    return appAxios().delete(`permit/note/${permitNoteId}`);
  },

  /**
   * @function updatePermit
   * @returns {Promise} An axios response
   */
  updatePermit(data: PermitNote) {
    return appAxios().put(`permit/note/${data.permitNoteId}`, data);
  }
};
