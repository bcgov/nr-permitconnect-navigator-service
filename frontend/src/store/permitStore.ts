import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';
import type { Permit, PermitType, SourceSystemCode } from '@/types';

export type PermitStoreState = {
  permit: Ref<Permit | undefined>;
  permitTypes: Ref<Array<PermitType>>;
  sourceSystems: Ref<Array<SourceSystemCode>>;
};

export const usePermitStore = defineStore('permit', () => {
  // State
  const state: PermitStoreState = {
    permit: ref(undefined),
    permitTypes: ref([]),
    sourceSystems: ref([])
  };

  // Getters
  const getters = {
    getPermit: computed(() => state.permit.value),
    getPermitTypes: computed(() => state.permitTypes.value),
    getSourceSystems: computed(() => state.sourceSystems.value)
  };

  // Actions
  function setPermit(data: Permit) {
    state.permit.value = data;
  }

  function setPermitTypes(data: Array<PermitType>) {
    state.permitTypes.value = data;
  }

  function setSourceSystems(data: Array<SourceSystemCode>) {
    state.sourceSystems.value = data;
  }

  function reset() {
    state.permit.value = undefined;
    state.permitTypes.value = [];
    state.sourceSystems.value = [];
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    setPermit,
    setPermitTypes,
    setSourceSystems,
    reset
  };
});

export default usePermitStore;
