<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, useToast } from '@/lib/primevue';
import { atsService } from '@/services';

import type { Ref } from 'vue';
import type { ATSUser } from '@/types';

// Props
const { submission } = defineProps<{
  submission: any;
}>();

// Emits
const emit = defineEmits(['atsUserDetails:unLink']);

// State
const loading: Ref<boolean> = ref(false);
const atsUsers: Ref<Array<ATSUser>> = ref([]);
const proponent: Ref<ATSUser | undefined> = ref(undefined);

const visible = defineModel<boolean>('visible');

// Actions

const toast = useToast();

async function getATSClientInformation() {
  try {
    loading.value = true;

    const response = await atsService.searchATSUsers({
      clientId: submission.atsClientNumber
    });

    atsUsers.value = response.data.clients.map((client: any) => {
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

watch(visible, () => {
  getATSClientInformation();
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-7"
  >
    <!-- <template #header>
      <span class="p-dialog-title title-colour">Proponent Details</span>
    </template> -->
    <!-- <DataTable
      :row-hover="true"
      class="datatable mt-3 mb-2"
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
    </DataTable> -->
    <!-- <h3 class="mt-4">ATS Client link</h3> -->
    <template #header>
      <span class="p-dialog-title title-colour">ATS Client link</span>
    </template>
    <DataTable
      :row-hover="true"
      :loading="loading"
      class="datatable mt-3 mb-2"
      :value="atsUsers"
      selection-mode="single"
      data-key="atsClientNumber"
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
        field="atsClientNumber"
        header="Client #"
      />
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
      <Column
        field="action"
        header="Action"
        class="text-center header-center"
      >
        <template #body="{ data }">
          <Button
            class="p-button-lg p-button-text p-button-danger p-0"
            aria-label="Delete enquiry"
            @click="atsUsers = atsUsers.filter((atsUser) => atsUser.atsClientNumber !== data.atsClientNumber)"
          >
            <font-awesome-icon icon="fa-solid fa-trash" />
          </Button>
        </template>
      </Column>
    </DataTable>
    <div class="flex justify-content-start mt-5">
      <Button
        class="p-button-solid mr-3"
        label="Save"
        @click="atsUsers.length == 0 ? emit('atsUserDetails:unLink') : (visible = false)"
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
<style scoped lang="scss">
.title-colour {
  color: $app-primary;
}
</style>
