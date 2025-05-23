<script setup lang="ts">
import axios from 'axios';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, IconField, InputIcon, InputText, Select, useToast } from '@/lib/primevue';
import { ssoService, yarsService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Group, User } from '@/types';

// Constants
const USER_SEARCH_PARAMS: { [key: string]: string } = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email'
};

// Composables
const { t } = useI18n();

// Emits
const emit = defineEmits(['userCreate:request']);

// Store
const authzStore = useAuthZStore();

// State
const loading: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const selectableGroups: Ref<Array<Group>> = ref([]);
const selectedGroup: Ref<Group | undefined> = ref(undefined);
const selectedParam: Ref<string | undefined> = ref('Last name');
const selectedUser: Ref<User | undefined> = ref(undefined);
const users: Ref<Array<User>> = ref([]);
const visible = defineModel<boolean>('visible');

// Actions
let cancelTokenSource: any = null;

const toast = useToast();

async function searchIdirUsers() {
  selectedUser.value = undefined;

  const searchParam =
    Object.keys(USER_SEARCH_PARAMS).find((key) => USER_SEARCH_PARAMS[key] === selectedParam.value) ||
    Object.keys(USER_SEARCH_PARAMS)[0];
  searchTag.value = searchTag.value.trim();

  if (searchTag.value.length > 2) {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Cancelling the previous request');
    }
    cancelTokenSource = axios.CancelToken.source();

    try {
      loading.value = true;

      const response = await ssoService.searchIdirUsers(
        {
          [searchParam]: searchTag.value
        },
        cancelTokenSource.token
      );

      // Map the response data to the required format
      // Spread the rest of the properties and filter out users without email
      users.value = response.data
        .map(({ attributes, username, ...rest }: any) => ({
          ...rest,
          sub: username,
          fullName: attributes?.display_name?.[0] as string
        }))
        .filter((user: any) => !!user.email);
    } catch (error) {
      if (!axios.isCancel(error)) toast.error('Error searching for users ' + error);
    } finally {
      cancelTokenSource = null;
      loading.value = false;
    }
  } else {
    users.value = [];
  }
}

watchEffect(async () => {
  const yarsGroups: Array<Group> = (await yarsService.getGroups(useAppStore().getInitiative)).data;

  const allowedGroups: Array<GroupName> = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
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
