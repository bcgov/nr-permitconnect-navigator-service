<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, Select } from '@/lib/primevue';
import { useAuthZStore } from '@/store';
import { GROUP_NAME_LIST } from '@/utils/constants/application';
import { GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Store
const authzStore = useAuthZStore();
const { getGroupOverride } = storeToRefs(authzStore);

const group: Ref<GroupName | undefined> = ref(undefined);

// Actions
const { t } = useI18n();

function clearGroup() {
  authzStore.setGroupOverride(undefined);
  group.value = undefined;
}

function setGroup(e: any) {
  authzStore.setGroupOverride(e.value);
  group.value = e.value;
}

onMounted(() => {
  group.value = getGroupOverride.value;
});
</script>

<template>
  <div
    v-if="getGroupOverride"
    class="px-2 py-1 flex align-items-center role-override"
  >
    <p class="m-0 mr-2">Viewing site as:</p>
    <div class="w-2 mr-2">
      <Select
        v-model="group"
        class="w-full"
        :options="GROUP_NAME_LIST"
        :option-label="(e: any) => t(`${e.text}`)"
        :option-value="(e: any) => e.id"
        @change="(e) => setGroup(e)"
      />
    </div>
    <div>
      <Button
        secondary
        @click="clearGroup"
      >
        End
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
p {
  color: black;
}

.role-override {
  background-color: #38598a;
}
</style>
