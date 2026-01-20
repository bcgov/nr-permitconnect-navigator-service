import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import { ConfigService } from '@/services';

import type { Ref } from 'vue';
import type { IdentityProvider } from '@/types';

interface Config {
  // Additional data passed from backend
  features: Record<string, boolean>;
  gitRev: string;
  idpList: IdentityProvider[];

  // Frontend config object
  apiPath?: string;
  ches: {
    roadmap: {
      bcc?: string;
    };
    submission: {
      cc?: string;
    };
  };
  coms: {
    apiPath?: string;
    bucketId?: string;
  };
  geocoder: {
    apiPath?: string;
  };
  notificationBanner?: string;
  oidc: {
    authority?: string;
    clientId?: string;
  };
  openStreetMap: {
    apiPath?: string;
  };
  orgbook: {
    apiPath?: string;
  };
}

export interface ConfigStoreState {
  config: Ref<Config | null>;
}

export const useConfigStore = defineStore('config', () => {
  const configService = new ConfigService();

  // State
  const state: ConfigStoreState = {
    config: ref(null)
  };

  // Getters
  const getters = {
    getConfig: computed(() => state.config.value)
  };

  // Actions
  async function init(): Promise<void> {
    await ConfigService.init();

    state.config.value = configService.getConfig();
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    init
  };
});

export default useConfigStore;
