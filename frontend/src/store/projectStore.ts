import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/permit';

import type { Ref } from 'vue';
import type { Document, ElectrificationProject, Enquiry, HousingProject, NoteHistory, Permit } from '@/types';

// Types
export type ProjectType = ElectrificationProject | HousingProject | undefined;

export type ProjectStoreState = {
  documents: Ref<Document[]>;
  relatedEnquiries: Ref<Enquiry[]>;
  noteHistory: Ref<NoteHistory[]>;
  permits: Ref<Permit[]>;
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
    getAuthsOnGoing: computed(() =>
      state.permits.value
        .filter(
          (p) =>
            [PermitAuthorizationStatus.IN_REVIEW, PermitAuthorizationStatus.PENDING].includes(
              p.authStatus as PermitAuthorizationStatus
            ) && ![PermitNeeded.NO, PermitNeeded.UNDER_INVESTIGATION].includes(p.needed as PermitNeeded)
        )
        .sort(permitNameSortFcn)
    ),
    getAuthsUnderInvestigation: computed(() =>
      state.permits.value
        .filter(
          (p) =>
            p.needed === PermitNeeded.UNDER_INVESTIGATION &&
            p.status === PermitStatus.NEW &&
            p.authStatus === PermitAuthorizationStatus.NONE
        )
        .sort(permitNameSortFcn)
        .sort(permitBusinessSortFcn)
    ),
    getAuthsNeeded: computed(() => {
      return state.permits.value
        .filter((p) => p.needed === PermitNeeded.YES && p.status === PermitStatus.NEW)
        .sort(permitNameSortFcn)
        .sort(permitBusinessSortFcn);
    }),
    getAuthsCompleted: computed(() => {
      const authsCompleted = state.permits.value.filter(
        (p) =>
          ![
            PermitAuthorizationStatus.NONE,
            PermitAuthorizationStatus.IN_REVIEW,
            PermitAuthorizationStatus.PENDING
          ].includes(p.authStatus as PermitAuthorizationStatus) &&
          ![PermitNeeded.NO, PermitNeeded.UNDER_INVESTIGATION].includes(p.needed as PermitNeeded)
      );
      const authsIssued = authsCompleted
        .filter((p) => p.authStatus === PermitAuthorizationStatus.ISSUED)
        .sort(permitNameSortFcn);
      const authsNotIssued = authsCompleted
        .filter((p) => p.authStatus !== PermitAuthorizationStatus.ISSUED)
        .sort(permitNameSortFcn);

      return [...authsIssued, ...authsNotIssued];
    }),
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
            ![PermitNeeded.NO, PermitNeeded.UNDER_INVESTIGATION].includes(p.needed as PermitNeeded)
        )
        .sort(permitNameSortFcn)
        .sort(permitBusinessSortFcn);
    }),
    getDocuments: computed(() => state.documents.value),
    getNoteHistory: computed(() => state.noteHistory.value),
    // Get array of note history that is shown to the proponent in descending order of creation date of the note
    getNoteHistoryShownToProponent: computed(() => {
      return state.noteHistory.value
        .filter((noteHistory) => noteHistory.shownToProponent)
        .sort((a, b) => {
          const aCreatedAt = a.note[0].createdAt!;
          const bCreatedAt = b.note[0].createdAt!;
          return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();
        });
    }),
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

  function addNoteHistory(data: NoteHistory, prepend: boolean = false) {
    if (prepend) state.noteHistory.value.unshift(data);
    else state.noteHistory.value.push(data);
  }

  function removeNoteHistory(data: NoteHistory) {
    state.noteHistory.value = state.noteHistory.value.filter((x) => x.noteHistoryId !== data.noteHistoryId);
  }

  function setNoteHistory(data: NoteHistory[]) {
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
