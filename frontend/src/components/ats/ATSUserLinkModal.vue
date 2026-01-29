<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, InputText, useToast } from '@/lib/primevue';
import { atsService } from '@/services';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { ATSClientResource } from '@/types';

// Props
const {
  firstName = undefined,
  lastName = undefined,
  phoneNumber = undefined,
  emailId = undefined
} = defineProps<{
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailId?: string;
}>();

// Composables
const { t } = useI18n();
const toast = useToast();

// Emits
const emit = defineEmits(['atsUserLink:link', 'atsUserLink:create']);

// Store
const appStore = useAppStore();
const { getInitiative } = storeToRefs(appStore);

// State
const atsClientId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const hasSearched: Ref<boolean> = ref(false);
const selectedUser: Ref<ATSClientResource | undefined> = ref(undefined);
const users: Ref<ATSClientResource[]> = ref([]);
const visible = defineModel<boolean>('visible');
const fName: Ref<string> = ref('');
const lName: Ref<string> = ref('');
const phone: Ref<string> = ref('');
const email: Ref<string> = ref('');

watchEffect(() => {
  fName.value = firstName ?? '';
  lName.value = lastName ?? '';
  phone.value = phoneNumber ?? '';
  email.value = emailId ?? '';
});

// Actions
async function searchATSUsers() {
  selectedUser.value = undefined;
  hasSearched.value = true;
  try {
    loading.value = true;

    const response = await atsService.searchATSUsers({
      firstName: fName.value,
      lastName: lName.value,
      clientId: atsClientId.value,
      phone: phone.value,
      email: email.value
    });
    users.value = response.data.clients;

    users.value.forEach((client: ATSClientResource) => {
      // Combine address lines and filter out empty lines
      const address = [client.address.addressLine1, client.address.addressLine2].filter(Boolean).join(', ');
      client.formattedAddress = address;
    });
  } catch (error) {
    toast.error(t('i.ats.common.errorSearchingUsers') + error);
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
          v-model="fName"
          :placeholder="t('i.ats.common.firstName')"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="lName"
          :placeholder="t('i.ats.common.lastName')"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="atsClientId"
          :placeholder="t('i.ats.atsUserLinkModal.clientNo')"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="phone"
          :placeholder="t('i.ats.atsUserLinkModal.phone')"
          class="w-full"
        />
      </div>
      <div class="col pr-0">
        <InputText
          v-model="email"
          :placeholder="t('i.ats.atsUserLinkModal.email')"
          class="w-full"
        />
      </div>
      <Button
        class="col p-button-solid"
        :label="t('i.ats.atsUserLinkModal.search')"
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
          <h5 class="m-0">{{ t('i.ats.common.noUsersFound') }}</h5>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>

      <Column
        field="clientId"
        :header="t('i.ats.atsUserLinkModal.clientNo')"
        sortable
      />
      <Column
        field="firstName"
        :header="t('i.ats.common.firstName')"
        sortable
      />
      <Column
        field="surName"
        :header="t('i.ats.common.lastName')"
        sortable
      />
      <Column
        field="address.primaryPhone"
        :header="t('i.ats.atsUserLinkModal.phone')"
        sortable
      />
      <Column
        field="address.email"
        :header="t('i.ats.atsUserLinkModal.email')"
        sortable
      />
      <Column
        v-if="getInitiative === Initiative.HOUSING"
        field="formattedAddress"
        :header="t('i.ats.common.locationAddress')"
        sortable
      />
    </DataTable>
    <div class="flex justify-between">
      <div>
        <Button
          class="p-button-solid mr-4"
          :label="t('i.ats.atsUserLinkModal.linkToPCNS')"
          :disabled="!selectedUser"
          @click="emit('atsUserLink:link', selectedUser)"
        />
        <Button
          class="mr-0"
          outlined
          :label="t('i.ats.common.cancel')"
          @click="visible = false"
        />
      </div>
      <div
        v-if="hasSearched"
        class="underline text-[var(--p-bcblue-900)] hover-hand"
        @click="emit('atsUserLink:create')"
      >
        {{ t('i.ats.common.createATSClient') }}
      </div>
    </div>
  </Dialog>
</template>
