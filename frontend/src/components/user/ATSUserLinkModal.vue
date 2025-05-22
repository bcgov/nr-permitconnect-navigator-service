<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, InputText, useToast } from '@/lib/primevue';
import { atsService } from '@/services';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { ATSClientResource } from '@/types';
import { computed } from 'vue';

// Props
const { fName, lName, phoneNumber, emailId } = defineProps<{
  fName: string;
  lName: string;
  phoneNumber: string;
  emailId: string;
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
const selectedUser: Ref<ATSClientResource | undefined> = ref(undefined);
const users: Ref<Array<ATSClientResource>> = ref([]);
const visible = defineModel<boolean>('visible');

const firstName = computed(() => {
  return fName;
});
const lastName = computed(() => {
  return lName;
});
const phone = computed(() => {
  return phoneNumber;
});
const email = computed(() => {
  return emailId;
});
// Actions
async function searchATSUsers() {
  selectedUser.value = undefined;
  try {
    loading.value = true;

    const response = await atsService.searchATSUsers({
      firstName: firstName.value,
      lastName: lastName.value,
      clientId: atsClientId.value,
      phone: phone.value,
      email: email.value
    });
    users.value = response.data.clients;

    users.value.forEach((client: ATSClientResource) => {
      // Combine address lines and filter out empty lines
      const address = [client.address.addressLine1, client.address.addressLine2].filter((line) => line).join(', ');
      client.formattedAddress = address;
    });
  } catch (error) {
    toast.error('Error searching for users ' + error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-1/2"
  >
    <template #header>
      <span class="p-dialog-title app-primary-color">Search ATS</span>
    </template>
    <div class="pt-1 mb-6 mr-1 grid grid-cols-6 gap-4">
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
          v-model="atsClientId"
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
      <Button
        class="col p-button-solid"
        label="Search"
        @click="searchATSUsers"
      />
    </div>
    <DataTable
      v-model:selection="selectedUser"
      :row-hover="true"
      :loading="loading"
      class="datatable mt-4 mb-2"
      :value="users"
      removable-sort
      selection-mode="single"
      data-key="clientId"
      :rows="5"
      :paginator="true"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
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
        field="clientId"
        header="Client #"
        sortable
      />
      <Column
        field="firstName"
        header="First Name"
        sortable
      />
      <Column
        field="surName"
        header="Last Name"
        sortable
      />
      <Column
        field="address.primaryPhone"
        header="Phone"
        sortable
      />
      <Column
        field="address.email"
        header="Email"
        sortable
      />
      <Column
        v-if="getInitiative === Initiative.HOUSING"
        field="formattedAddress"
        header="Location address"
        sortable
      />
    </DataTable>
    <div class="flex justify-start">
      <Button
        class="p-button-solid mr-4"
        label="Link to PCNS"
        :disabled="!selectedUser"
        @click="emit('atsUserLink:link', selectedUser)"
      />
      <Button
        class="mr-0"
        outlined
        label="Cancel"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
