<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, InputText, Message, useToast } from '@/lib/primevue';
import { contactService } from '@/services';
import { toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

// Composables
const toast = useToast();

// Emits
const emit = defineEmits(['contactSearch:pick', 'contactSearch:manualEntry']);

// Composables
const { t } = useI18n();

// State
const contacts: Ref<Array<Contact>> = ref([]);
const hasSearched: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const selectedContact: Ref<Contact | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');

// Actions
async function searchContacts() {
  hasSearched.value = true;
  selectedContact.value = undefined;
  try {
    loading.value = true;

    const response = await contactService.matchContacts(
      toNumber(searchTag.value)
        ? { phoneNumber: searchTag.value }
        : { firstName: searchTag.value, lastName: searchTag.value, email: searchTag.value }
    );

    contacts.value = response.data;
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
      <span class="p-dialog-title app-primary-color">{{ t('i.contact.contactSearchModal.searchContacts') }}</span>
    </template>
    <div class="pt-1 mb-6 mr-1 grid grid-cols-6 gap-4">
      <div class="col-span-5 pr-0">
        <InputText
          v-model="searchTag"
          :placeholder="t('i.contact.contactSearchModal.searchPlaceholder')"
          class="w-full"
          @keydown.enter="searchContacts"
        />
      </div>
      <Button
        class="col p-button-solid"
        label="Search"
        :disabled="loading || !searchTag.trim()"
        @click="searchContacts"
      />
    </div>
    <Message
      v-if="contacts.length > 1"
      severity="warn"
      class="text-center"
      :closable="false"
    >
      {{ t('i.contact.contactSearchModal.multipleContactsBannerDescrition') }}
    </Message>
    <DataTable
      v-model:selection="selectedContact"
      :row-hover="true"
      :loading="loading"
      class="datatable mt-4 mb-2"
      :value="contacts"
      removable-sort
      selection-mode="single"
      data-key="contactId"
      :rows="5"
      :paginator="true"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
    >
      <template #empty>
        <div class="flex justify-center">
          <h5 class="m-0">{{ t('i.contact.contactSearchModal.noContactsFound') }}</h5>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>
      <Column field="userId">
        <template #body="{ data }">
          <font-awesome-icon
            v-if="data.userId"
            icon="fa-solid fa-user"
            class="app-primary-color"
          />
        </template>
      </Column>
      <Column
        field="firstName"
        :header="t('i.contact.contactSearchModal.firstName')"
        sortable
      />
      <Column
        field="lastName"
        :header="t('i.contact.contactSearchModal.lastName')"
        sortable
      />
      <Column
        field="phoneNumber"
        :header="t('i.contact.contactSearchModal.contactPhone')"
        sortable
      />
      <Column
        field="email"
        :header="t('i.contact.contactSearchModal.contactEmail')"
        sortable
      />
    </DataTable>
    <div class="flex justify-between items-center">
      <div>
        <Button
          class="p-button-solid mr-4"
          :label="t('i.contact.contactSearchModal.save')"
          :disabled="!selectedContact"
          @click="emit('contactSearch:pick', selectedContact)"
        />
        <Button
          class="mr-0"
          outlined
          label="Cancel"
          @click="visible = false"
        />
      </div>
      <div>
        <a
          v-if="hasSearched"
          class="ml-4 text-blue-500 hover:underline cursor-pointer"
          @click="emit('contactSearch:manualEntry')"
        >
          {{ t('i.contact.contactSearchModal.manualEntry') }}
        </a>
      </div>
    </div>
  </Dialog>
</template>
