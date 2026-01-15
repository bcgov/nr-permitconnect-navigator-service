<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, Select } from '@/lib/primevue';
import { useAuthZStore } from '@/store';
import { GROUP_NAME_LIST } from '@/utils/constants/application';
import { GroupName, Initiative } from '@/utils/enums/application';

import type { SelectChangeEvent } from 'primevue/select';
import type { Ref } from 'vue';

// Types
interface GroupList {
  id: string;
  text: string;
}

// Store
const authzStore = useAuthZStore();
const { getGroupOverride, getInitiativeOverride } = storeToRefs(authzStore);

const group: Ref<GroupName | undefined> = ref(undefined);
const initiative: Ref<Initiative | undefined> = ref(undefined);

// Actions
const { t } = useI18n();

function clear() {
  authzStore.setGroupOverride(undefined);
  authzStore.setInitiativeOverride(undefined);
  group.value = undefined;
  initiative.value = undefined;
}

function setGroup(e: SelectChangeEvent) {
  authzStore.setGroupOverride(e.value);
  group.value = e.value;
}

function setInitiative(e: SelectChangeEvent) {
  authzStore.setInitiativeOverride(e.value);
  initiative.value = e.value;
}

onBeforeMount(() => {
  group.value = getGroupOverride.value;
  initiative.value = getInitiativeOverride.value;
});
</script>

<template>
  <div class="px-2 py-1 flex items-center role-override">
    <p class="m-0 mr-2">Viewing site as:</p>
    <Select
      v-model="initiative"
      class="w-2/12 mr-2"
      :options="[Initiative.ELECTRIFICATION, Initiative.HOUSING, Initiative.PCNS]"
      @change="(e) => setInitiative(e)"
    />
    <Select
      v-model="group"
      class="w-2/12 mr-2"
      :options="GROUP_NAME_LIST"
      :option-label="(e: GroupList) => t(`${e.text}`)"
      :option-value="(e: GroupList) => e.id"
      @change="(e) => setGroup(e)"
    />
    <div>
      <Button
        secondary
        @click="clear"
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
