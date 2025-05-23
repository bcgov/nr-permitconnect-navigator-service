<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog } from '@/lib/primevue';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';
import { computed } from 'vue';

// Props
const { address, firstName, lastName, phone, email } = defineProps<{
  firstName: string;
  lastName: string;
  address?: string;
  phone: string;
  email: string;
}>();

// Emits
const emit = defineEmits(['atsUserCreate:link', 'atsUserCreate:create']);

// Store
const appStore = useAppStore();
const { getInitiative } = storeToRefs(appStore);

// State
const loading: Ref<boolean> = ref(false);
const visible = defineModel<boolean>('visible');

// Actions
const atsUser = computed(() => {
  return {
    firstName: firstName,
    lastName: lastName,
    email: email,
    address: address,
    phone: phone
  };
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-max"
  >
    <template #header>
      <span class="p-dialog-title app-primary-color">Create new client in ATS</span>
    </template>
    <div>
      <DataTable
        :row-hover="true"
        class="datatable mt-4 mb-6"
        :value="[atsUser]"
        selection-mode="single"
        :rows="1"
      >
        <template #empty>
          <div class="flex justify-center">
            <h5 class="m-0">No users found.</h5>
          </div>
        </template>
        <template #loading>
          <Spinner />
        </template>

        <Column
          field="firstName"
          header="First Name"
        />
        <Column
          field="lastName"
          header="Last Name"
        />
        <Column
          field="phone"
          header="Phone"
        />
        <Column
          field="email"
          header="Email"
        />
        <Column
          v-if="getInitiative === Initiative.HOUSING"
          field="address"
          header="Location address"
        />
      </DataTable>
      <div
        v-if="!loading"
        class="flex justify-start"
      >
        <Button
          class="p-button-solid mr-4"
          label="Push to ATS"
          icon="pi pi-upload"
          @click="emit('atsUserCreate:create')"
        />
        <Button
          class="mr-0"
          outlined
          label="Cancel"
          @click="visible = false"
        />
      </div>
      <Spinner v-if="loading" />
    </div>
  </Dialog>
</template>
