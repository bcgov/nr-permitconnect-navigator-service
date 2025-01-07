<script setup lang="ts">
import { Button, Dialog } from '@/lib/primevue';

// Emits
const emit = defineEmits(['userAction:process']);

// State
const visible = defineModel<boolean>('visible');
const action = defineModel<string>('action');
const requestType = defineModel<string>('requestType');

// Construct headers and messages
const headers: Record<string, string> = {
  'Approve-access': 'Approve access request',
  'Approve-revocation': 'Approve revocation request',
  'Deny-access': 'Deny access request',
  'Deny-revocation': 'Deny revocation request'
};

const messages: Record<string, string> = {
  'Approve-access': 'This user will now be an authorized user.',
  'Approve-revocation': 'This user will now lose all access to the system.',
  // eslint-disable-next-line max-len
  'Deny-access': "This user's approval request will be denied, and access will not be granted", // eslint-disable-line quotes
  // eslint-disable-next-line max-len
  'Deny-revocation': "This user's revocation request will be denied, and they will remain authorized" // eslint-disable-line quotes
};

const labels: Record<string, string> = {
  'Approve-access': 'Approve',
  'Approve-revocation': 'Revoke user',
  'Deny-access': 'Deny',
  'Deny-revocation': 'Deny'
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-4/12"
  >
    <template #header>
      <span class="p-dialog-title">{{ headers[`${action}-${requestType}`] }}</span>
    </template>
    <div>{{ messages[`${action}-${requestType}`] }}</div>
    <div class="flex mt-8 justify-between">
      <span>
        <Button
          class="mr-2"
          :class="{ 'p-button-danger': action === 'Deny' || requestType === 'revocation' }"
          :label="labels[`${action}-${requestType}`]"
          icon="pi pi-check"
          @click="
            () => {
              emit('userAction:process');
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
