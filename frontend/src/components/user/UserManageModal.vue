<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { RadioList } from '@/components/form';
import { yarsService } from '@/services';
import { useAuthZStore } from '@/store';
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
const selectableGroups: Ref<Map<string, GroupName>> = ref(new Map());
const group: Ref<GroupName | undefined> = ref(undefined);

// Actions
onMounted(async () => {
  const yarsGroups: Array<Group> = (await yarsService.getGroups()).data;

  const allowedGroups: Array<GroupName> = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
  if (authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER])) {
    allowedGroups.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
  }

  selectableGroups.value = new Map(
    allowedGroups.map((groupName) => {
      const group = yarsGroups.find((group) => group.name === groupName);
      return [group?.label ?? groupName.toLowerCase(), groupName];
    })
  );
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
    <div>Select role</div>
    <RadioList
      name="role"
      :bold="false"
      :options="[...selectableGroups.keys()]"
      class="mt-4 mb-6"
      @on-change="(value) => (group = selectableGroups.get(value))"
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
