<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, useToast } from '@/lib/primevue';
import { atsService } from '@/services';
import { useAppStore } from '@/store';
import { BasicResponse, Initiative } from '@/utils/enums/application';
import { setEmptyStringsToNull } from '@/utils/utils';

import type { Ref } from 'vue';
import type { ATSClientResource, ElectrificationProject, Enquiry, HousingProject } from '@/types';
import type { AddressResource } from '@/types/ATSClientResource';

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

// Composables
const toast = useToast();

// Emits
const emit = defineEmits(['atsUserLink:link']);

// Store
const appStore = useAppStore();
const { getInitiative } = storeToRefs(appStore);

// State
const atsClientId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const atsUser: Ref<ATSUser | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');

// Actions
async function createATSClient() {
  try {
    loading.value = true;

    // TODO: Remove conditional when prisma db has full mappings
    const contact =
      'enquiryId' in projectOrEnquiry || getInitiative.value === Initiative.HOUSING
        ? projectOrEnquiry.contacts[0]
        : projectOrEnquiry.activity?.activityContact?.[0]?.contact;

    const address: Partial<AddressResource> = {
      '@type': 'AddressResource',
      primaryPhone: contact?.phoneNumber ?? '',
      email: contact?.email ?? ''
    };

    if ('streetAddress' in projectOrEnquiry) address.addressLine1 = projectOrEnquiry.streetAddress;
    if ('locality' in projectOrEnquiry) address.city = projectOrEnquiry.streetAddress;
    if ('province' in projectOrEnquiry) address.provinceCode = projectOrEnquiry.streetAddress;

    const data = {
      '@type': 'ClientResource',
      address: address,
      firstName: contact?.firstName,
      surName: contact?.lastName,
      regionName: getInitiative.value,
      optOutOfBCStatSurveyInd: BasicResponse.NO.toUpperCase()
    };

    const submitData: ATSClientResource = setEmptyStringsToNull(data);

    const response = await atsService.createATSClient(submitData);
    if (response.status === 201) {
      atsClientId.value = response.data.clientId;
      emit('atsUserLink:link', atsClientId.value);
      visible.value = false;
      toast.success('New client pushed to ATS');
    } else {
      toast.error('Error pushing client to ATS');
    }
  } catch (error) {
    toast.error('Error pushing client to ATS ' + error);
  } finally {
    loading.value = false;
  }
}

onBeforeMount(() => {
  const locationAddressStr = [
    'streetAddress' in projectOrEnquiry ? projectOrEnquiry.streetAddress : '',
    'locality' in projectOrEnquiry ? projectOrEnquiry.streetAddress : '',
    'province' in projectOrEnquiry ? projectOrEnquiry.streetAddress : ''
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
          @click="createATSClient()"
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
