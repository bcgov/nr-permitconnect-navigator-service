<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, useToast } from '@/lib/primevue';
import { atsService } from '@/services';
import { BasicResponse } from '@/utils/enums/application';
import { setEmptyStringsToNull } from '@/utils/utils';

import type { Ref } from 'vue';
import type { ATSClientResource, Enquiry, Submission } from '@/types';
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
const { submissionOrEnquiry } = defineProps<{
  submissionOrEnquiry: Enquiry | Submission;
}>();

// Constants
const ATS_REGION_NAME: string = 'Navigator';

// Emits
const emit = defineEmits(['atsUserLink:link']);

// State
const atsClientId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const atsUser: Ref<ATSUser | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');

// Actions

const toast = useToast();

async function createATSClient() {
  try {
    loading.value = true;

    const address: Partial<AddressResource> = {
      '@type': 'AddressResource',
      primaryPhone: submissionOrEnquiry.contacts[0]?.phoneNumber ?? '',
      email: submissionOrEnquiry.contacts[0]?.email ?? ''
    };

    if ('streetAddress' in submissionOrEnquiry) address.addressLine1 = submissionOrEnquiry.streetAddress;
    if ('locality' in submissionOrEnquiry) address.city = submissionOrEnquiry.streetAddress;
    if ('province' in submissionOrEnquiry) address.provinceCode = submissionOrEnquiry.streetAddress;

    const data = {
      '@type': 'ClientResource',
      address: address,
      firstName: submissionOrEnquiry.contacts[0]?.firstName,
      surName: submissionOrEnquiry?.contacts[0]?.lastName,
      regionName: ATS_REGION_NAME,
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
    'streetAddress' in submissionOrEnquiry ? submissionOrEnquiry.streetAddress : '',
    'locality' in submissionOrEnquiry ? submissionOrEnquiry.streetAddress : '',
    'province' in submissionOrEnquiry ? submissionOrEnquiry.streetAddress : ''
  ]
    .filter((str) => str?.trim())
    .join(', ');

  atsUser.value = {
    firstName: submissionOrEnquiry.contacts[0]?.firstName ?? '',
    lastName: submissionOrEnquiry.contacts[0]?.lastName ?? '',
    email: submissionOrEnquiry.contacts[0]?.email ?? '',
    address: locationAddressStr,
    phone: submissionOrEnquiry.contacts[0]?.phoneNumber ?? ''
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
