import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Ref } from 'vue';
import type { PermitType } from '@/types';

export type TypeStoreState = {
  permitTypes: Ref<Array<PermitType>>;
};

export const useTypeStore = defineStore('type', () => {
  // State
  const state: TypeStoreState = {
    permitTypes: ref([])
  };

  // Getters
  const getters = {
    getPermitTypes: computed(() => state.permitTypes.value)
  };

  // Actions
  function setPermitTypes(data: Array<PermitType>) {
    state.permitTypes.value = data;
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    setPermitTypes
  };
});

export default useTypeStore;
