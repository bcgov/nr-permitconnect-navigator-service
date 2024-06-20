<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { CopyToClipboard } from '@/components/form';
import { Button, Dropdown } from '@/lib/primevue';
import { useAuthStore, useConfigStore } from '@/store';
import { ButtonMode, RouteName } from '@/utils/enums/application';
import { ACCESS_ROLES_LIST } from '@/utils/constants/application';
import { useRouter } from 'vue-router';
import { PermissionService } from '@/services';

// Store
const authStore = useAuthStore();
const { getAccessToken, getProfile } = storeToRefs(authStore);
const { getConfig } = storeToRefs(useConfigStore());

const permissionService = new PermissionService();
const router = useRouter();

async function ssoRequestBasicAccess() {
  await permissionService.requestBasicAccess();
}

async function ssGetRoles() {
  await permissionService.getRoles();
}
</script>

<template>
  <h2>Developer</h2>
  <div>
    <div class="px-2 py-1 flex align-items-center">
      <p class="m-0 mr-2">Begin viewing site as:</p>
      <div class="w-2 mr-2">
        <Dropdown
          class="w-full"
          :options="ACCESS_ROLES_LIST"
          @change="
            (e) => {
              permissionService.setRoleOverride(e.value);
              router.push({ name: RouteName.HOME });
            }
          "
        />
      </div>
    </div>

    <div class="flex align-items-center mt-3">
      <h3 class="mr-2">Config</h3>
      <div>
        <CopyToClipboard
          :mode="ButtonMode.ICON"
          :to-copy="JSON.stringify(getConfig)"
        />
      </div>
    </div>
    {{ getConfig }}

    <div class="flex align-items-center mt-3">
      <h3 class="mr-2">Token</h3>
      <div>
        <CopyToClipboard
          :mode="ButtonMode.ICON"
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
          :mode="ButtonMode.ICON"
          :to-copy="JSON.stringify(getProfile)"
        />
      </div>
    </div>
    {{ getProfile }}

    <div class="flex align-items-center mt-3">
      <h3 class="mr-2">SSO Test</h3>
      <div>
        <Button @click="ssoRequestBasicAccess">SSO Test</Button>
      </div>
      <div>
        <Button @click="ssGetRoles">SSO Test 2</Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h3 {
  margin-top: 1em;
}
</style>
