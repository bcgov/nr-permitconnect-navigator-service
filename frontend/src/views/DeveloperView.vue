<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { CopyToClipboard } from '@/components/form';
import { Dropdown } from '@/lib/primevue';
import { useAuthNStore, useAuthZStore, useConfigStore } from '@/store';
import { ButtonMode } from '@/utils/enums/application';
import { GROUP_NAME_LIST } from '@/utils/constants/application';

// Store
const authnStore = useAuthNStore();
const { getAccessToken, getProfile } = storeToRefs(authnStore);
const { getConfig } = storeToRefs(useConfigStore());
const authzStore = useAuthZStore();

// Actions
const { t } = useI18n();
</script>

<template>
  <h2>Developer</h2>
  <div
    v-if="getConfig"
    class="version px-3 py-2"
  >
    v{{ getConfig.version }}{{ getConfig.gitRev ? '-' + getConfig.gitRev.substring(0, 8) : '' }}
  </div>
  <div>
    <div class="px-2 py-1 flex align-items-center">
      <p class="m-0 mr-2">Begin viewing site as:</p>
      <div class="w-2 mr-2">
        <Dropdown
          class="w-full"
          :options="GROUP_NAME_LIST"
          :option-label="(e) => t(`${e.text}`)"
          :option-value="(e) => e.id"
          @change="
            (e) => {
              authzStore.setGroupOverride(e.value);
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
  </div>
</template>

<style lang="scss" scoped>
h3 {
  margin-top: 1em;
}
</style>
