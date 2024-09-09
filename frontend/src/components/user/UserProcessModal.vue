<script setup lang="ts">
import { Button, Dialog } from '@/lib/primevue';

// Emits
const emit = defineEmits(['userAction:process']);

// State
const visible = defineModel<boolean>('visible');
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-4"
  >
    <template #header>
      <span class="p-dialog-title">Approve or deny user</span>
    </template>
    <div>Approve to authorize this user or deny access.</div>
    <div class="flex mt-5 justify-content-between">
      <span>
        <Button
          class="mr-2"
          label="Approve"
          icon="pi pi-check"
          @click="
            () => {
              emit('userAction:process', true);
              visible = false;
            }
          "
        />
        <Button
          class="mr-2 p-button-danger"
          label="Deny"
          icon="pi pi-times"
          @click="
            () => {
              emit('userAction:process', false);
              visible = false;
            }
          "
        />
      </span>
      <span>
        <Button
          class="p-button-outlined mr-2"
          label="Cancel"
          icon="pi pi-times"
          @click="visible = false"
        />
      </span>
    </div>
  </Dialog>
</template>
