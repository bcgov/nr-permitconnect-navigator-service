import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { Permit, PermitType } from '@/types';

export interface PermitStoreState {
  permit: Ref<Permit | undefined>;
  permitTypes: Ref<PermitType[]>;
}

export const usePermitStore = defineStore('permit', () => {
  // State
  const state: PermitStoreState = {
    permit: ref(undefined),
    permitTypes: ref([])
  };

  // Getters
  const getters = {
    getPermit: computed(() => state.permit.value),
    getPermitTypes: computed(() => state.permitTypes.value)
  };

  // Actions
  function setPermit(data: Permit) {
    state.permit.value = data;
  }

  function setPermitTypes(data: PermitType[]) {
    state.permitTypes.value = data;
  }

  function reset() {
    state.permit.value = undefined;
    state.permitTypes.value = [];
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    setPermit,
    setPermitTypes,
    reset
  };
});

export default usePermitStore;
