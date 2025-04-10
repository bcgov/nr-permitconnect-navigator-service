import { useAppStore } from '@/store';
import { appAxios } from './interceptors';

import type { PermitNote } from '@/types';

const PATH = 'permit/note';

export default {
  /**
   * @function createPermitNote
   * @returns {Promise} An axios response
   */
  createPermitNote(data: Partial<PermitNote>) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, data);
  },

  /**
   * @function deletePermitNote
   * @returns {Promise} An axios response
   */
  deletePermitNote(permitNoteId: string) {
    return appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${permitNoteId}`);
  },

  /**
   * @function updatePermit
   * @returns {Promise} An axios response
   */
  updatePermit(data: PermitNote) {
    return appAxios().put(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${data.permitNoteId}`, data);
  }
};
