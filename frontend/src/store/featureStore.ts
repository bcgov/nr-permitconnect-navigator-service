import { defineStore } from 'pinia';
import { computed } from 'vue';

import useConfigStore from '@/store/configStore';
import { isTruthy } from '@/utils/utils';

export const useFeatureStore = defineStore('feature', () => {
  // Getters
  const getters = {
    isPeachEnabled: computed(() => isTruthy(useConfigStore().getConfig?.features.peach))
  };

  return {
    // Getters
    ...getters
  };
});

export default useFeatureStore;
