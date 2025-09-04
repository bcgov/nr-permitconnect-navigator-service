import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { NoteHistory } from '@/types';

export type NoteHistoryStoreState = {
  noteHistory: Ref<NoteHistory | undefined>;
};

export const useNoteHistoryStore = defineStore('noteHistory', () => {
  // State
  const state: NoteHistoryStoreState = {
    noteHistory: ref(undefined)
  };

  // Getters
  const getters = {
    getNoteHistory: computed(() => state.noteHistory.value)
  };

  // Actions
  function setNoteHistory(data: NoteHistory) {
    state.noteHistory.value = data;
  }

  function reset() {
    state.noteHistory.value = undefined;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    setNoteHistory,
    reset
  };
});

export default useNoteHistoryStore;
