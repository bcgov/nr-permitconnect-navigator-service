<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { Button, Column, DataTable, Dialog, InputText, useToast } from '@/lib/primevue';

import { Spinner } from '@/components/layout';
import { atsService } from '@/services';

import type { Ref } from 'vue';
import type { ATSUser, Submission } from '@/types';

// Props
const { submission } = defineProps<{
  submission: Submission;
}>();

// Emits
const emit = defineEmits(['atsUserLink:link']);

// State
const atsClientNumber: Ref<string> = ref('');
const email: Ref<string> = ref('');
const firstName: Ref<string> = ref('');
const lastName: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const phone: Ref<string> = ref('');
const proponent: Ref<ATSUser | undefined> = ref(undefined);
const selectedUser: Ref<ATSUser | undefined> = ref(undefined);
const showCreateATS = defineModel<boolean>('showCreateATS');
const users: Ref<Array<ATSUser>> = ref([]);
const visible = defineModel<boolean>('visible');

// Actions

const toast = useToast();

async function searchATSUsers() {
  selectedUser.value = undefined;
  try {
    loading.value = true;

    const response = await atsService.searchATSUsers({
      firstName: firstName.value,
      lastName: lastName.value,
      clientId: atsClientNumber.value,
      phone: phone.value,
      email: email.value
    });

    showCreateATS.value = true;

    users.value = response.data.clients.map((client: any) => {
      // Combine address lines and filter out empty lines
      const address = [client.address.addressLine1, client.address.addressLine2].filter((line) => line).join(', ');

      return {
        atsClientNumber: client.clientId,
        firstName: client.firstName,
        lastName: client.surName,
        email: client.address.email,
        phone: client.address.primaryPhone ?? client.address.secondaryPhone,
        address: address
      };
    });
  } catch (error) {
    if (!axios.isCancel(error)) toast.error('Error searching for users ' + error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (submission.contactFirstName && submission.contactLastName) {
    firstName.value = submission.contactFirstName;
    lastName.value = submission.contactLastName;
  }
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
      <span class="p-dialog-title title-colour">Search ATS</span>
    </template>
    <div class="pt-1 mb-4 mr-1 grid">
      <div class="col pr-0">
        <InputText
          v-model="firstName"
          placeholder="First name"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="lastName"
          placeholder="Last name"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="atsClientNumber"
          placeholder="ATS client # (optional)"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="phone"
          placeholder="Phone (optional)"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="email"
          placeholder="Email (optional)"
          class="w-full"
        />
      </div>
      <div class="col-fixed w-1">
        <Button
          class="p-button-solid"
          label="Search"
          @click="searchATSUsers"
        />
      </div>
    </div>
    <DataTable
      v-model:selection="selectedUser"
      :row-hover="true"
      :loading="loading"
      class="datatable mt-3 mb-2"
      :value="users"
      selection-mode="single"
      data-key="atsClientNumber"
      :rows="5"
      :paginator="true"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
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
        field="atsClientNumber"
        header="Client #"
        sortable
      />
      <Column
        field="firstName"
        header="First Name"
        sortable
      />
      <Column
        field="lastName"
        header="Last Name"
        sortable
      />
      <Column
        field="phone"
        header="Phone"
        sortable
      />
      <Column
        field="email"
        header="Email"
        sortable
      />
      <Column
        field="address"
        header="Location address"
        sortable
      />
    </DataTable>
    <div class="flex justify-content-end">
      <Button
        class="p-button-solid mr-0"
        label="Link to PCNS"
        :disabled="!selectedUser"
        @click="emit('atsUserLink:link', selectedUser)"
      />
    </div>
  </Dialog>
</template>
<style scoped lang="scss">
.title-colour {
  color: $app-primary;
}
</style>
