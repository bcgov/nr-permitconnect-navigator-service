import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { Document, Note, Permit, Submission } from '@/types';

export type SubmissionStoreState = {
  documents: Ref<Array<Document>>;
  notes: Ref<Array<Note>>;
  permits: Ref<Array<Permit>>;
  submission: Ref<Submission | undefined>;
};

export const useSubmissionStore = defineStore('submission', () => {
  // State
  const state: SubmissionStoreState = {
    documents: ref([]),
    notes: ref([]),
    permits: ref([]),
    submission: ref(undefined)
  };

  // Getters
  const getters = {
    getDocuments: computed(() => state.documents.value),
    getNotes: computed(() => state.notes.value),
    getPermits: computed(() => state.permits.value),
    getSubmission: computed(() => state.submission.value)
  };

  // Actions
  function addDocument(data: Document) {
    state.documents.value.push(data);
  }

  function removeDocument(data: Document) {
    state.documents.value = state.documents.value.filter((x) => x.documentId !== data.documentId);
  }

  function setDocuments(data: Array<Document>) {
    state.documents.value = data;
  }

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

  function addPermit(data: Permit) {
    state.permits.value.push(data);
  }

  function removePermit(data: Permit) {
    state.permits.value = state.permits.value.filter((x) => x.permitId !== data.permitId);
  }

  function setPermits(data: Array<Permit>) {
    state.permits.value = data;
  }

  function updatePermit(data: Permit) {
    const idx = state.permits.value.findIndex((x: Permit) => x.permitId === data.permitId);
    if (idx >= 0) state.permits.value[idx] = data;
  }

  function setSubmission(data: Submission | undefined) {
    state.submission.value = data;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    addDocument,
    removeDocument,
    setDocuments,
    addNote,
    removeNote,
    setNotes,
    updateNote,
    addPermit,
    removePermit,
    setPermits,
    updatePermit,
    setSubmission
  };
});

export default useSubmissionStore;
