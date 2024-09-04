<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { RadioList } from '@/components/form';
import { useAuthZStore } from '@/store';
import { Button, Dialog } from '@/lib/primevue';
import { GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Emits
const emit = defineEmits(['userManage:save']);

// Store
const authzStore = useAuthZStore();

// State
const visible = defineModel<boolean>('visible');
const selectableGroups: Ref<Array<GroupName>> = ref([]);
const group: Ref<GroupName | undefined> = ref(undefined);

// Actions
onMounted(() => {
  selectableGroups.value = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
  if (authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER])) {
    selectableGroups.value.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
  }
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-3"
  >
    <template #header>
      <span class="p-dialog-title">Manage user role</span>
    </template>
    <div>Select role</div>
    <RadioList
      name="role"
      :bold="false"
      :options="selectableGroups"
      class="mt-3 mb-4"
      @on-change="(value) => (group = value)"
    />
    <div class="flex-auto">
      <Button
        class="mr-2"
        label="Save"
        type="submit"
        icon="pi pi-check"
        @click="emit('userManage:save', group)"
      />
      <Button
        class="p-button-outlined mr-2"
        label="Cancel"
        icon="pi pi-times"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
