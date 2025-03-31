import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { Enquiry, Note } from '@/types';

export type EnquiryStoreState = {
  notes: Ref<Array<Note>>;
  enquiry: Ref<Enquiry | undefined>;
};

export const useEnquiryStore = defineStore('enquiry', () => {
  // State
  const state: EnquiryStoreState = {
    notes: ref([]),
    enquiry: ref(undefined)
  };

  // Getters
  const getters = {
    getNotes: computed(() => state.notes.value),
    getEnquiry: computed(() => state.enquiry.value)
  };

  // Actions
  /* Notes */
  function addNote(data: Note, prepend: boolean = false) {
    if (prepend) state.notes.value.unshift(data);
    else state.notes.value.push(data);
  }

  function removeNote(data: Note) {
    state.notes.value = state.notes.value.filter((x) => x.noteId !== data.noteId);
  }

  function setNotes(data: Array<Note>) {
    state.notes.value = data;
  }

  function updateNote(oldData: Note, newData: Note) {
    const idx = state.notes.value.findIndex((x: Note) => x.noteId === oldData.noteId);
    if (idx >= 0) state.notes.value[idx] = newData;
  }

  /* Enquiries */
  function setEnquiry(data: Enquiry | undefined) {
    state.enquiry.value = data;
  }

  function removeEnquiry() {
    state.enquiry.value = undefined;
  }

  function reset() {
    state.notes.value = [];
    state.enquiry.value = undefined;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    addNote,
    removeNote,
    setNotes,
    updateNote,
    removeEnquiry,
    setEnquiry,
    reset
  };
});

export default useEnquiryStore;
