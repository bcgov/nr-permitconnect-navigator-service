<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, useToast } from '@/lib/primevue';
import { atsService } from '@/services';

import type { Ref } from 'vue';
import type { ATSClientResource } from '@/types';

// Props
const {
  atsClientId,
  disabled = false,
  relatedEnquiry = false
} = defineProps<{
  atsClientId: string | number | null;
  disabled?: boolean;
  relatedEnquiry?: boolean;
}>();

// Emits
const emit = defineEmits(['atsUserDetails:unLink']);

// State
const loading: Ref<boolean> = ref(false);
const users: Ref<Array<ATSClientResource>> = ref([]);
const visible = defineModel<boolean>('visible');

// Composables
const { t } = useI18n();

// Actions
const toast = useToast();

async function getATSClientInformation() {
  try {
    loading.value = true;

    const response = await atsService.searchATSUsers({
      clientId: atsClientId
    });

    users.value = response.data.clients;

    users.value.forEach((client: ATSClientResource) => {
      // Combine address lines and filter out empty lines
      const address = [client.address.addressLine1, client.address.addressLine2].filter((line) => line).join(', ');
      client.formattedAddress = address;
    });
  } catch (error) {
    toast.error(t('i.ats.atsUserDetailsModal.errorSearchingUsers') + error);
  } finally {
    loading.value = false;
  }
}

watch(visible, () => {
  if (atsClientId) getATSClientInformation();
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-7/12"
  >
    <template #header>
      <span class="p-dialog-title app-primary-color">{{ t('i.ats.atsUserDetailsModal.atsClientLink') }}</span>
    </template>
    <DataTable
      :row-hover="true"
      :loading="loading"
      class="datatable mt-4 mb-2"
      :value="users"
      selection-mode="single"
      data-key="atsClientId"
      :rows="1"
    >
      <template #empty>
        <div class="flex justify-center">
          <h5 class="m-0">{{ t('i.ats.atsUserDetailsModal.noUsersFound') }}</h5>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>

      <Column
        field="clientId"
        :header="t('i.ats.atsUserDetailsModal.clientNo')"
      />
      <Column
        field="firstName"
        :header="t('i.ats.atsUserDetailsModal.firstName')"
      />
      <Column
        field="surName"
        :header="t('i.ats.atsUserDetailsModal.lastName')"
      />
      <Column
        field="address.primaryPhone"
        :header="t('i.ats.atsUserDetailsModal.phone')"
      />
      <Column
        field="address.email"
        :header="t('i.ats.atsUserDetailsModal.email')"
      />
      <Column
        field="formattedAddress"
        :header="t('i.ats.atsUserDetailsModal.locationAddress')"
      />
      <Column
        field="action"
        :header="t('i.ats.atsUserDetailsModal.action')"
        class="text-center header-center"
      >
        <template #body="{ data }">
          <Button
            class="p-button-lg p-button-text p-button-danger p-0"
            :aria-label="t('i.ats.atsUserDetailsModal.deleteUser')"
            :disabled="disabled || relatedEnquiry"
            @click="users = users.filter((atsUser) => atsUser.clientId !== data.clientId)"
          >
            <font-awesome-icon icon="fa-solid fa-trash" />
          </Button>
        </template>
      </Column>
    </DataTable>
    <div class="flex justify-start mt-8">
      <Button
        class="p-button-solid mr-4"
        :class="{ 'no-underline': disabled }"
        :label="t('i.ats.atsUserDetailsModal.save')"
        :disabled="disabled"
        @click="users.length == 0 ? emit('atsUserDetails:unLink') : (visible = false)"
      />
      <Button
        class="mr-0"
        outlined
        :label="t('i.ats.atsUserDetailsModal.cancel')"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
