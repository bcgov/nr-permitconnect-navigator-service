<script setup lang="ts">
import { Mutex } from 'async-mutex';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, IconField, InputIcon, InputText, Select, useToast } from '@/lib/primevue';
import { ssoService, yarsService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Group, User } from '@/types';

// Constants
const USER_SEARCH_PARAMS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email'
};

// Interfaces
interface IdirResult {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  attributes: {
    display_name: string[];
    idir_user_guid: string[];
    idir_username: string[];
  };
}

// Composables
const { t } = useI18n();
const toast = useToast();

// Emits
const emit = defineEmits(['userCreate:request']);

// Store
const authzStore = useAuthZStore();

// State
const loading: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const selectableGroups: Ref<Group[]> = ref([]);
const selectedGroup: Ref<Group | undefined> = ref(undefined);
const selectedParam: Ref<string | undefined> = ref('Last name');
const selectedUser: Ref<User | undefined> = ref(undefined);
const users: Ref<User[]> = ref([]);
const visible = defineModel<boolean>('visible');

const searchMutex = new Mutex();
let timeoutId: ReturnType<typeof setTimeout>;

// Actions
async function searchIdirUsers() {
  selectedUser.value = undefined;

  const searchParam =
    Object.keys(USER_SEARCH_PARAMS).find((key) => USER_SEARCH_PARAMS[key] === selectedParam.value) ||
    Object.keys(USER_SEARCH_PARAMS)[0]!;
  searchTag.value = searchTag.value.trim();

  if (searchTag.value.length >= MIN_SEARCH_INPUT_LENGTH) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await searchMutex.runExclusive(async () => {
        try {
          loading.value = true;

          const response = await ssoService.searchIdirUsers({
            [searchParam]: searchTag.value
          });

          // Map the response data to the required format
          // Spread the rest of the properties and filter out users without email
          users.value = response.data
            .map(({ attributes, username, ...rest }: IdirResult) => ({
              ...rest,
              sub: username,
              fullName: attributes?.display_name?.[0]
            }))
            .filter((user: User) => !!user.email);
        } catch (error) {
          toast.error(t('userCreateModal.searchError'), String(error));
        } finally {
          loading.value = false;
        }
      });
    }, 500);
  } else {
    users.value = [];
    clearTimeout(timeoutId);
    loading.value = false;
  }
}

watchEffect(async () => {
  const yarsGroups: Group[] = (await yarsService.getGroups(useAppStore().getInitiative)).data;

  const allowedGroups: GroupName[] = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
  if (authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER])) {
    allowedGroups.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
  }

  selectableGroups.value = yarsGroups.filter((x) => allowedGroups.includes(x.name));
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
      <span class="p-dialog-title">{{ t('userCreateModal.header') }}</span>
    </template>
    <div class="grid grid-cols-12 gap-4 items-center">
      <Select
        v-model="selectedParam"
        class="col-span-3"
        name="searchParam"
        :placeholder="t('userCreateModal.lastNamePlaceholder')"
        :options="Object.values(USER_SEARCH_PARAMS)"
        @change="searchIdirUsers"
      />
      <div class="col-span-9">
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchTag"
            class="w-full"
            :placeholder="t('userCreateModal.searchPlaceholder')"
            autofocus
            @update:model-value="searchIdirUsers"
          />
        </IconField>
      </div>
    </div>
    <DataTable
      v-model:selection="selectedUser"
      :row-hover="true"
      :loading="loading"
      class="datatable mt-4 mb-2"
      :value="users"
      removable-sort
      selection-mode="single"
      data-key="sub"
      :rows="5"
      :paginator="true"
    >
      <template #empty>
        <div class="flex justify-center">
          <h5 class="m-0">{{ t('userCreateModal.empty') }}</h5>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>
      <Column
        field="fullName"
        :header="t('userCreateModal.headerFullname')"
        sortable
      />
      <Column
        field="firstName"
        :header="t('userCreateModal.headerFirstName')"
        sortable
      />
      <Column
        field="lastName"
        :header="t('userCreateModal.headerLastName')"
        sortable
      />
      <Column
        field="email"
        :header="t('userCreateModal.headerEmail')"
        sortable
      />
    </DataTable>
    <label
      id="assignRole-label"
      for="assignRole"
      class="font-bold"
    >
      {{ t('userCreateModal.assign') }}
    </label>
    <Select
      v-model="selectedGroup"
      class="w-full"
      name="assignRole"
      :options="selectableGroups"
      option-label="label"
      :disabled="!selectedUser"
    />
    <div class="mt-6">
      <Button
        class="mr-2"
        :label="t('userCreateModal.requestApproval')"
        type="submit"
        icon="pi pi-check"
        :disabled="!selectedUser || !selectedGroup"
        @click="
          () => {
            emit('userCreate:request', { ...selectedUser }, selectedGroup);
          }
        "
      />
      <Button
        class="p-button-outlined mr-2"
        :label="t('userCreateModal.cancel')"
        icon="pi pi-times"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
