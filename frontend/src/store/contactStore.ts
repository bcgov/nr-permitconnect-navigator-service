import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

export interface ContactStoreState {
  contact: Ref<Contact | undefined>;
}

export const useContactStore = defineStore('contact', () => {
  // State
  const state: ContactStoreState = {
    contact: ref(undefined)
  };

  // Getters
  const getters = {
    getContact: computed(() => state.contact.value),
    needsContactDetails: computed(() => {
      const contact = state.contact.value;
      return !contact?.phoneNumber || !contact?.contactApplicantRelationship || !contact?.contactPreference;
    })
  };

  // Actions
  function setContact(data: Contact) {
    state.contact.value = data;
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    setContact
  };
});

export default useContactStore;
