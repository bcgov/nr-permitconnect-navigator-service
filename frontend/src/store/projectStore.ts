import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/permit';

import type { Ref } from 'vue';
import type { Document, ElectrificationProject, Enquiry, HousingProject, Note, Permit } from '@/types';

// Types
export type ProjectType = ElectrificationProject | HousingProject | undefined;

export type ProjectStoreState = {
  documents: Ref<Array<Document>>;
  relatedEnquiries: Ref<Array<Enquiry>>;
  notes: Ref<Array<Note>>;
  permits: Ref<Array<Permit>>;
  project: Ref<ProjectType>;
};

export const useProjectStore = defineStore('project', () => {
  // State
  const state: ProjectStoreState = {
    documents: ref([]),
    relatedEnquiries: ref([]),
    notes: ref([]),
    permits: ref([]),
    project: ref(undefined)
  };

  // Getters
  const getters = {
    getAuthsOnGoing: computed(() =>
      state.permits.value.filter((p) =>
        [PermitAuthorizationStatus.IN_REVIEW, PermitAuthorizationStatus.PENDING].includes(
          p.authStatus as PermitAuthorizationStatus
        )
      )
    ),
    getAuthsUnderInvestigation: computed(() =>
      state.permits.value.filter((p) => p.needed === PermitNeeded.UNDER_INVESTIGATION)
    ),
    getAuthsNeeded: computed(() => {
      return state.permits.value
        .filter((p) => p.needed === PermitNeeded.YES && p.status === PermitStatus.NEW)
        .sort(permitNameSortFcn)
        .sort(permitBusinessSortFcn);
    }),
    getAuthsCompleted: computed(() =>
      state.permits.value.filter(
        (p) =>
          ![
            PermitAuthorizationStatus.NONE,
            PermitAuthorizationStatus.IN_REVIEW,
            PermitAuthorizationStatus.PENDING
          ].includes(p.authStatus as PermitAuthorizationStatus)
      )
    ),
    getAuthsNotNeeded: computed(() => {
      return state.permits.value
        .filter((p) => p.needed === PermitNeeded.NO)
        .sort(permitNameSortFcn)
        .sort(permitBusinessSortFcn);
    }),
    getAuthsSubmitted: computed(() => {
      return state.permits.value
        .filter(
          (p) =>
            p.authStatus !== PermitAuthorizationStatus.NONE &&
            p.status !== PermitStatus.NEW &&
            p.needed !== PermitNeeded.NO
        )
        .sort(permitNameSortFcn)
        .sort(permitBusinessSortFcn);
    }),
    getDocuments: computed(() => state.documents.value),
    getNotes: computed(() => state.notes.value),
    getPermits: computed(() => state.permits.value),
    getRelatedEnquiries: computed(() => state.relatedEnquiries.value),
    getProject: computed(() => state.project.value)
  };

  // Actions
  function permitBusinessSortFcn(a: Permit, b: Permit) {
    return a.permitType.businessDomain > b.permitType.businessDomain ? 1 : -1;
  }

  function permitNameSortFcn(a: Permit, b: Permit) {
    return a.permitType.name > b.permitType.name ? 1 : -1;
  }

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
    state.notes.value = [];
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
    addNote,
    removeNote,
    setNotes,
    updateNote,
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
