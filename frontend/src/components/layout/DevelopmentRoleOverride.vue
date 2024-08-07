<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Button, Dropdown } from '@/lib/primevue';
import { usePermissionStore } from '@/store';
import { GROUP_NAME_LIST } from '@/utils/constants/application';
import { GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';

// Store
const permissionStore = usePermissionStore();
const { getGroupOverride } = storeToRefs(permissionStore);

const group: Ref<GroupName | undefined> = ref(undefined);

// Actions
function clearGroup() {
  permissionStore.setGroupOverride(undefined);
  group.value = undefined;
}

function setGroup(e: any) {
  permissionStore.setGroupOverride(e.value);
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
      <Dropdown
        v-model="group"
        class="w-full"
        :options="GROUP_NAME_LIST"
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
