import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { Document, ElectrificationProject, Enquiry, HousingProject, NoteHistory, Permit } from '@/types';

// Types
export type ProjectType = ElectrificationProject | HousingProject | undefined;

export type ProjectStoreState = {
  documents: Ref<Array<Document>>;
  relatedEnquiries: Ref<Array<Enquiry>>;
  noteHistory: Ref<Array<NoteHistory>>;
  permits: Ref<Array<Permit>>;
  project: Ref<ProjectType>;
};

export const useProjectStore = defineStore('project', () => {
  // State
  const state: ProjectStoreState = {
    documents: ref([]),
    relatedEnquiries: ref([]),
    noteHistory: ref([]),
    permits: ref([]),
    project: ref(undefined)
  };

  // Getters
  const getters = {
    getDocuments: computed(() => state.documents.value),
    getNoteHistory: computed(() => state.noteHistory.value),
    getPermits: computed(() => state.permits.value),
    getRelatedEnquiries: computed(() => state.relatedEnquiries.value),
    getProject: computed(() => state.project.value)
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

  function addPermit(data: Permit) {
    state.permits.value.push(data);
  }

  function removePermit(data: Permit) {
    state.permits.value = state.permits.value.filter((x) => x.permitId !== data.permitId);
  }

  function setPermits(data: Array<Permit>) {
    state.permits.value = data;
  }

  function addRelatedEnquiry(data: Enquiry) {
    state.relatedEnquiries.value.push(data);
  }

  function removeRelatedEnquiry(data: Enquiry) {
    state.relatedEnquiries.value = state.relatedEnquiries.value.filter((x) => x.enquiryId !== data.enquiryId);
  }

  function setRelatedEnquiries(data: Array<Enquiry>) {
    state.relatedEnquiries.value = data;
  }

  function updatePermit(data: Permit) {
    const idx = state.permits.value.findIndex((x: Permit) => x.permitId === data.permitId);
    if (idx >= 0) state.permits.value[idx] = data;
  }

  function setProject(data: ProjectType) {
    state.project.value = data;
  }

  function reset() {
    state.documents.value = [];
    state.relatedEnquiries.value = [];
    state.noteHistory.value = [];
    state.permits.value = [];
    state.project.value = undefined;
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
    addNoteHistory,
    removeNoteHistory,
    setNoteHistory,
    updateNoteHistory,
    addPermit,
    removePermit,
    setPermits,
    updatePermit,
    addRelatedEnquiry,
    removeRelatedEnquiry,
    setRelatedEnquiries,
    setProject,
    reset
  };
});

export default useProjectStore;
