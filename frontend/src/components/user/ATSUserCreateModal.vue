<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { Button, Column, DataTable, Dialog, useToast } from '@/lib/primevue';

import { Spinner } from '@/components/layout';
import { atsService } from '@/services';
import { BasicResponse } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { ATSUser, Submission } from '@/types';

// Props
const { submission } = defineProps<{
  submission: Submission;
}>();

// Emits
const emit = defineEmits(['atsUserLink:link']);

// Constants
const REGION_BC = 'BC';

// State
const atsClientNumber: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const proponent: Ref<ATSUser | undefined> = ref(undefined);
const selectedUser: Ref<ATSUser | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');

// Actions

const toast = useToast();

async function createATSClient() {
  selectedUser.value = undefined;
  try {
    loading.value = true;

    const data = setEmptyStringsToNullAndOmitNulls({
      '@type': 'ClientResource',
      address: {
        '@type': 'AddressResource',
        addressLine1: submission.streetAddress,
        city: submission.locality,
        provinceCode: submission.province,
        primaryPhone: submission.contactPhoneNumber,
        email: submission.contactEmail
      },
      firstName: submission.contactFirstName,
      surName: submission.contactLastName,
      regionName: REGION_BC,
      optOutOfBCStatSurveyInd: BasicResponse.NO.toUpperCase()
    });

    const response = await atsService.createATSClient(data);
    if (response.status === 201) {
      atsClientNumber.value = response.data.clientId;
      emit('atsUserLink:link', atsClientNumber.value);
      toast.success('New client pushed to ATS');
    } else {
      toast.error('Error pushing client to ATS');
    }
  } catch (error) {
    if (!axios.isCancel(error)) toast.error('Error pushing client to ATS ' + error);
  } finally {
    loading.value = false;
  }
}

function setEmptyStringsToNullAndOmitNulls(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string' && obj[key].trim() === '') {
        // Skip adding this key if the value is an empty string
        continue;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nestedResult = setEmptyStringsToNullAndOmitNulls(obj[key]);
        if (Object.keys(nestedResult).length > 0) {
          result[key] = nestedResult;
        }
      } else if (obj[key] !== null) {
        result[key] = obj[key];
      }
    }
  }

  return result;
}
onMounted(async () => {
  const locationAddressStr = [submission.streetAddress, submission.locality, submission.province]
    .filter((str) => str?.trim())
    .join(', ');

  proponent.value = {
    firstName: submission.contactFirstName ?? '',
    lastName: submission.contactLastName ?? '',
    email: submission.contactEmail ?? '',
    address: locationAddressStr,
    phone: submission.contactPhoneNumber ?? ''
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
      <span class="p-dialog-title title-colour">Create new client in ATS</span>
    </template>
    <div>
      <DataTable
        :row-hover="true"
        class="datatable mt-3 mb-4"
        :value="[proponent]"
        selection-mode="single"
        :rows="1"
      >
        <template #empty>
          <div class="flex justify-content-center">
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
          field="lastName"
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
      <div class="flex justify-content-end">
        <Button
          class="p-button-solid"
          label="Push to ATS"
          icon="pi pi-upload"
          visible="false"
          @click="createATSClient()"
        />
      </div>
    </div>
  </Dialog>
</template>
<style scoped lang="scss">
.title-colour {
  color: $app-primary;
}
</style>
