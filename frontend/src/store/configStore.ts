import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { configService } from '@/services';

import type { Ref } from 'vue';
import type { Config } from '@/types';

export interface ConfigStoreState {
  config: Ref<Config | null>;
}

export const useConfigStore = defineStore('config', () => {
  const state: ConfigStoreState = {
    config: ref(null)
  };

  const getters = {
    getConfig: computed(() => state.config.value)
  };

  async function init(): Promise<void> {
    const config = await configService.getConfig();
    state.config.value = config;
  }

  return {
    ...state,
    ...getters,
    init
  };
});

export default useConfigStore;
