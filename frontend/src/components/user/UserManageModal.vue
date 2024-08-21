<script setup lang="ts">
import { ref } from 'vue';

import { RadioList } from '@/components/form';
import { Button, Dialog } from '@/lib/primevue';
import { GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Emits
const emit = defineEmits(['userManage:save']);

// State
const visible = defineModel<boolean>('visible');
const role: Ref<string | undefined> = ref(undefined);
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
      :options="[GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY]"
      class="mt-3 mb-4"
      @on-change="(value) => (role = value)"
    />
    <div class="flex-auto">
      <Button
        class="mr-2"
        label="Save"
        type="submit"
        icon="pi pi-check"
        @click="emit('userManage:save', role)"
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
