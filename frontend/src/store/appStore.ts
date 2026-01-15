import { Initiative, Zone } from '@/utils/enums/application';
import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';

export interface AppStoreState {
  initiative: Ref<Initiative>;
  loadingCalls: Ref<number>;
  loadingInterval: Ref<ReturnType<typeof setTimeout> | undefined>;
  loadingMode: Ref<'determinate' | 'indeterminate'>;
  loadingValue: Ref<number>;
  zone: Ref<Zone>;
}

export const useAppStore = defineStore('app', () => {
  // State
  const state: AppStoreState = {
    initiative: ref(Initiative.PCNS),
    loadingCalls: ref(0),
    loadingInterval: ref(undefined),
    loadingMode: ref('indeterminate'),
    loadingValue: ref(0),
    zone: ref(Zone.GLOBAL)
  };

  // Getters
  const getters = {
    getInitiative: computed(() => state.initiative.value),
    getIsLoading: computed(() => state.loadingCalls.value > 0),
    getLoadingCalls: computed(() => state.loadingCalls.value),
    getLoadingMode: computed(() => state.loadingMode.value),
    getLoadingValue: computed(() => state.loadingValue.value),
    getZone: computed(() => state.zone.value)
  };

  // Actions
  function setInitiative(initiative: Initiative) {
    state.initiative.value = initiative;
  }

  function setZone(zone: Zone) {
    state.zone.value = zone;
  }

  function beginDeterminateLoading() {
    state.loadingValue.value = 0;
    ++state.loadingCalls.value;
    state.loadingMode.value = 'determinate';
    state.loadingInterval.value = setInterval(() => {
      let newValue = state.loadingValue.value + Math.floor(Math.random() * 10) + 1;
      if (newValue >= 100) newValue = 100;
      state.loadingValue.value = newValue;
    }, 1000);
  }

  function beginIndeterminateLoading() {
    ++state.loadingCalls.value;
    state.loadingMode.value = 'indeterminate';
  }

  function endDeterminateLoading() {
    state.loadingValue.value = 100;
    setTimeout(() => {
      clearInterval(state.loadingInterval.value);
      state.loadingInterval.value = undefined;
      --state.loadingCalls.value;
    }, 300);
  }

  function endIndeterminateLoading() {
    setTimeout(() => {
      --state.loadingCalls.value;
    }, 300);
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    setInitiative,
    setZone,
    beginDeterminateLoading,
    beginIndeterminateLoading,
    endDeterminateLoading,
    endIndeterminateLoading
  };
});

export default useAppStore;
