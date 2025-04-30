<script setup lang="ts">
import axios from 'axios';
import { ref, watchEffect } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, IconField, InputIcon, InputText, Select, useToast } from '@/lib/primevue';
import { ssoService, yarsService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { GroupName } from '@/utils/enums/application';

import type { SelectChangeEvent } from 'primevue/select';
import type { Ref } from 'vue';
import type { Group, User } from '@/types';

// Constants
const USER_SEARCH_PARAMS: { [key: string]: string } = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email'
};

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
      <span class="p-dialog-title">Create new user</span>
    </template>
    <div class="grid grid-cols-12 gap-4 items-center">
      <Select
        v-model="selectedParam"
        class="col-span-3"
        name="searchParam"
        placeholder="Last name"
        :options="Object.values(USER_SEARCH_PARAMS)"
        @change="searchIdirUsers"
      />
      <div class="col-span-9">
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchTag"
            class="w-full"
            placeholder="Search by first name, last name, or email"
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
          <h5 class="m-0">No users found.</h5>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>
      <Column
        field="fullName"
        header="Username"
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
        field="email"
        header="Email"
        sortable
      />
    </DataTable>
    <Select
      v-model="selectedGroup"
      class="w-full"
      name="assignRole"
      label="Assign role"
      :options="selectableGroups"
      option-label="label"
      :disabled="!selectedUser"
    />
    <div class="mt-6">
      <Button
        class="mr-2"
        label="Request approval"
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
        label="Cancel"
        icon="pi pi-times"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
