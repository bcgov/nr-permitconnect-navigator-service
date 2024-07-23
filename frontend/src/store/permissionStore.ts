import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type { Ref } from 'vue';

export type PermissionStoreState = {
  permissions: Ref<Array<any>>;
};

export const usePermissionStore = defineStore('permission', () => {
  // State
  const state: PermissionStoreState = {
    permissions: ref([])
  };

  // Getters
  const getters = {
    can: computed(
      () => (initiative: string, resource: string, action: string) =>
        state.permissions.value.find(
          (x) => x.initiative === initiative && x.resource === resource && x.action === action
        )
    )
  };

  // Actions
  function setPermissions(data: any) {
    state.permissions.value = data;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    setPermissions
  };
});

export default usePermissionStore;
