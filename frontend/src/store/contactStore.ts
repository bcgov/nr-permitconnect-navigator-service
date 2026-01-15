import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

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
    getContact: computed(() => state.contact.value)
  };

  // Actions
  function setContact(data: Contact) {
    state.contact.value = data;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    setContact
  };
});

export default useContactStore;
