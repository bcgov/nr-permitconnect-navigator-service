<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { CopyToClipboard } from '@/components/form';
import { Dropdown } from '@/lib/primevue';
import { useAuthStore, useConfigStore } from '@/store';
import { BUTTON_MODE } from '@/utils/enums';
import { AccessRoles, RouteNames } from '@/utils/constants';
import { useRouter } from 'vue-router';

// Store
const authStore = useAuthStore();
const { getAccessToken, getProfile } = storeToRefs(authStore);
const { getConfig } = storeToRefs(useConfigStore());

const router = useRouter();
</script>

<template>
  <h2>Developer</h2>
  <div>
    <div class="px-2 py-1 flex align-items-center">
      <p class="m-0 mr-2">Begin viewing site as:</p>
      <div class="w-2 mr-2">
        <Dropdown
          class="w-full"
          :options="[...AccessRoles, 'NONE']"
          @change="
            (e) => {
              authStore.setRoleOverride(e.value);
              router.push({ name: RouteNames.HOME });
            }
          "
        />
      </div>
    </div>

    <div class="flex align-items-center mt-3">
      <h3 class="mr-2">Config</h3>
      <div>
        <CopyToClipboard
          :mode="BUTTON_MODE.ICON"
          :to-copy="JSON.stringify(getConfig)"
        />
      </div>
    </div>
    {{ getConfig }}

    <div class="flex align-items-center mt-3">
      <h3 class="mr-2">Token</h3>
      <div>
        <CopyToClipboard
          :mode="BUTTON_MODE.ICON"
          :to-copy="getAccessToken"
        />
      </div>
    </div>

    <div class="wrap-block">
      {{ getAccessToken }}
    </div>

    <div class="flex align-items-center mt-3">
      <h3 class="mr-2">Profile</h3>
      <div>
        <CopyToClipboard
          :mode="BUTTON_MODE.ICON"
          :to-copy="JSON.stringify(getProfile)"
        />
      </div>
    </div>
    {{ getProfile }}
  </div>
</template>

<style lang="scss" scoped>
h3 {
  margin-top: 1em;
}
</style>
