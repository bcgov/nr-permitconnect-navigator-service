import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { Context } from '@/types';

export type EnquiryStoreState = {
  context: Ref<Context | undefined>;
};

export const useContextStore = defineStore('context', () => {
  // State
  const state: EnquiryStoreState = {
    context: ref(undefined)
  };

  // Getters
  const getters = {
    getContext: computed(() => state.context.value)
  };

  // Actions
  function setContext(data: Context | undefined) {
    state.context.value = data;
  }

  function removeContext() {
    state.context.value = undefined;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    removeContext,
    setContext
  };
});

export default useContextStore;
