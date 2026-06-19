import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import useAppStore from '@/store/appStore';

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
    getAllPermitTypes: computed(() => state.permitTypes.value),
    getInitiativePermitTypes: computed(() =>
      state.permitTypes.value
        .filter((permit) =>
          permit.permitTypeInitiativeXref?.some((xref) => xref.initiative.code === useAppStore().getInitiative)
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ permitTypeInitiativeXref, ...permit }) => permit)
    )
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
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    setPermit,
    setPermitTypes,
    reset
  };
});

export default usePermitStore;
