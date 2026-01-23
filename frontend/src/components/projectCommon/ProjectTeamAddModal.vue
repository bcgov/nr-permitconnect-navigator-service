<script setup lang="ts">
import { Mutex } from 'async-mutex';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import {
  Button,
  Column,
  DataTable,
  Dialog,
  IconField,
  InputIcon,
  InputText,
  Message,
  Select,
  useToast
} from '@/lib/primevue';
import { contactService } from '@/services';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact, Contact } from '@/types';

// Props
const { activityContacts } = defineProps<{
  activityContacts: ActivityContact[];
}>();

// Composables
const { t } = useI18n();
const toast = useToast();

// Constants
const SELECTABLE_ROLES = [ActivityContactRole.ADMIN, ActivityContactRole.MEMBER];

// Emits
const emit = defineEmits(['projectTeamAddModal:addUser']);

// State
const loading: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const selectedRole: Ref<ActivityContactRole | undefined> = ref(undefined);
const selectedUser: Ref<Contact | undefined> = ref(undefined);
const selectedUserExists: Ref<boolean> = ref(false);
const contacts: Ref<Contact[]> = ref([]);
const visible = defineModel<boolean>('visible');

const searchMutex = new Mutex();

// Actions
async function searchProponents() {
  selectedUser.value = undefined;

  if (searchTag.value.length >= MIN_SEARCH_INPUT_LENGTH) {
    await searchMutex.runExclusive(async () => {
      try {
        loading.value = true;

        contacts.value = (
          await contactService.matchContacts({
            firstName: searchTag.value,
            lastName: searchTag.value
          })
        ).data;
      } catch (error) {
        toast.error(t('userCreateModal.searchError'), String(error));
      } finally {
        loading.value = false;
      }
    });
  } else {
    contacts.value = [];
    loading.value = false;
  }
}

watch(selectedUser, () => {
  selectedUserExists.value = activityContacts.some((x) => x.contactId === selectedUser.value?.contactId);
});

watch(visible, () => {
  contacts.value = [];
  searchTag.value = '';
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6/12"
  >
    <template #header>
      <span class="p-dialog-title">{{ t('e.common.projectTeamAddModal.header') }}</span>
    </template>
    <Message
      v-if="selectedUserExists"
      severity="error"
      class="text-center mb-8"
    >
      {{ t('e.common.projectTeamAddModal.contactAlreadyExists') }}
    </Message>
    <Message
      v-if="selectedRole === ActivityContactRole.ADMIN"
      severity="warn"
      class="text-center mb-8"
    >
      {{ t('e.common.projectTeamAddModal.adminSelectedWarning') }}
    </Message>
    <div class="grid grid-cols-12 gap-4 items-center">
      <div class="col-span-10">
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchTag"
            class="w-full"
            :placeholder="t('e.common.projectTeamAddModal.searchPlaceholder')"
            autofocus
          />
        </IconField>
      </div>
      <div class="col-span-2">
        <Button
          class="w-full"
          :label="t('e.common.projectTeamAddModal.search')"
          @click="searchProponents"
        />
      </div>
    </div>
    <DataTable
      v-model:selection="selectedUser"
      :row-hover="true"
      :loading="loading"
      class="datatable mt-4 mb-2"
      :value="contacts"
      removable-sort
      selection-mode="single"
      data-key="contactId"
      :rows="5"
      :paginator="true"
    >
      <template #empty>
        <div class="flex justify-center">
          <h5 class="m-0">{{ t('e.common.projectTeamAddModal.empty') }}</h5>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>
      <Column
        field="firstName"
        :header="t('e.common.projectTeamAddModal.headerFirstName')"
        sortable
      />
      <Column
        field="lastName"
        :header="t('e.common.projectTeamAddModal.headerLastName')"
        sortable
      />
      <Column
        field="phoneNumber"
        :header="t('e.common.projectTeamAddModal.headerPhone')"
        sortable
      />
      <Column
        field="email"
        :header="t('e.common.projectTeamAddModal.headerEmail')"
        sortable
      />
    </DataTable>
    <label
      id="assignRole-label"
      for="assignRole"
      class="font-bold"
    >
      {{ t('e.common.projectTeamAddModal.assign') }}
    </label>
    <Select
      v-model="selectedRole"
      class="w-full"
      name="assignRole"
      :options="SELECTABLE_ROLES"
      :disabled="!selectedUser || selectedUserExists"
    />
    <div class="mt-6">
      <Button
        class="mr-2"
        :label="t('e.common.projectTeamAddModal.addUser')"
        type="submit"
        icon="pi pi-check"
        :disabled="!selectedUser || !selectedRole"
        @click="
          () => {
            emit('projectTeamAddModal:addUser', { ...selectedUser }, selectedRole);
          }
        "
      />
      <Button
        class="p-button-outlined mr-2"
        :label="t('e.common.projectTeamAddModal.cancel')"
        icon="pi pi-times"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
