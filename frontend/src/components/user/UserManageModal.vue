<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import { RadioButton } from '@/lib/primevue';
import { yarsService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { Button, Dialog } from '@/lib/primevue';
import { GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Group } from '@/types';

// Emits
const emit = defineEmits(['userManage:save']);

// Store
const authzStore = useAuthZStore();

// State
const visible = defineModel<boolean>('visible');
const selectableGroups: Ref<Array<Group>> = ref([]);
const group: Ref<Group | undefined> = ref(undefined);

// Actions
watchEffect(async () => {
  const yarsGroups: Array<Group> = (await yarsService.getGroups(useAppStore().getInitiative)).data;

  const allowedGroups: Array<GroupName> = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
  if (authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER])) {
    allowedGroups.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
  }

  selectableGroups.value = yarsGroups.filter((x) => allowedGroups.includes(x.name));
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-3/12"
  >
    <template #header>
      <span class="p-dialog-title">Manage user role</span>
    </template>
    <div class="mb-2">Select role</div>
    <div
      v-for="option in selectableGroups"
      :key="option.groupId"
      class="flex flex-col items-start mb-2"
    >
      <div>
        <RadioButton
          v-model="group"
          :aria-describedby="`role-help`"
          :aria-labelledby="`role-option-${option.groupId}`"
          name="role"
          :value="option"
        />
        <span
          :id="`role-option-${option.groupId}`"
          :for="option"
          class="ml-2 mb-0"
        >
          {{ option.label }}
        </span>
      </div>
    </div>
    <div class="flex-auto mt-6">
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
