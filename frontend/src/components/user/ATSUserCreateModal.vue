<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog } from '@/lib/primevue';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { ElectrificationProject, Enquiry, HousingProject } from '@/types';

// Types
type ATSUser = {
  address: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

// Props
const { projectOrEnquiry } = defineProps<{
  projectOrEnquiry: Enquiry | HousingProject | ElectrificationProject;
}>();

// Emits
const emit = defineEmits(['atsUserCreate:link', 'atsUserCreate:create']);

// Store
const appStore = useAppStore();
const { getInitiative } = storeToRefs(appStore);

// State
const loading: Ref<boolean> = ref(false);
const atsUser: Ref<ATSUser | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');

// Actions
onBeforeMount(() => {
  const locationAddressStr = [
    'streetAddress' in projectOrEnquiry ? projectOrEnquiry.streetAddress : '',
    'locality' in projectOrEnquiry ? projectOrEnquiry.locality : '',
    'province' in projectOrEnquiry ? projectOrEnquiry.province : ''
  ]
    .filter((str) => str?.trim())
    .join(', ');

  // TODO: Remove conditional when prisma db has full mappings
  const contact =
    'enquiryId' in projectOrEnquiry || getInitiative.value === Initiative.HOUSING
      ? projectOrEnquiry.contacts[0]
      : projectOrEnquiry.activity?.activityContact?.[0]?.contact;

  atsUser.value = {
    firstName: contact?.firstName ?? '',
    lastName: contact?.lastName ?? '',
    email: contact?.email ?? '',
    address: locationAddressStr,
    phone: contact?.phoneNumber ?? ''
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
