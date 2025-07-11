import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { Enquiry, NoteHistory } from '@/types';

export type EnquiryStoreState = {
  noteHistory: Ref<Array<NoteHistory>>;
  enquiry: Ref<Enquiry | undefined>;
};

export const useEnquiryStore = defineStore('enquiry', () => {
  // State
  const state: EnquiryStoreState = {
    noteHistory: ref([]),
    enquiry: ref(undefined)
  };

  // Getters
  const getters = {
    getNoteHistory: computed(() => state.noteHistory.value),
    getEnquiry: computed(() => state.enquiry.value)
  };

  // Actions
  /* Notes */
  function addNoteHistory(data: NoteHistory, prepend: boolean = false) {
    if (prepend) state.noteHistory.value.unshift(data);
    else state.noteHistory.value.push(data);
  }

  function removeNoteHistory(data: NoteHistory) {
    state.noteHistory.value = state.noteHistory.value.filter((x) => x.noteHistoryId !== data.noteHistoryId);
  }

  function setNoteHistory(data: Array<NoteHistory>) {
    state.noteHistory.value = data;
  }

  function updateNoteHistory(data: NoteHistory) {
    const idx = state.noteHistory.value.findIndex((x: NoteHistory) => x.noteHistoryId === data.noteHistoryId);
    if (idx >= 0) state.noteHistory.value[idx] = data;
  }

  /* Enquiries */
  function setEnquiry(data: Enquiry | undefined) {
    state.enquiry.value = data;
  }

  function removeEnquiry() {
    state.enquiry.value = undefined;
  }

  function reset() {
    state.noteHistory.value = [];
    state.enquiry.value = undefined;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    addNoteHistory,
    removeNoteHistory,
    setNoteHistory,
    updateNoteHistory,
    removeEnquiry,
    setEnquiry,
    reset
  };
});

export default useEnquiryStore;
