<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';

import { Dropdown } from '@/components/form';
import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, IconField, InputIcon, InputText, useToast } from '@/lib/primevue';
import { ssoService } from '@/services';
import { GroupName } from '@/utils/enums/application';

import type { DropdownChangeEvent } from 'primevue/dropdown';
import type { Ref } from 'vue';
import type { UserAccessRequest } from '@/types';

// Constants
const USER_SEARCH_PARAMS: { [key: string]: string } = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email'
};

// Emits
const emit = defineEmits(['userCreate:request']);

// State
const loading: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const selectedRole: Ref<string | undefined> = ref(undefined);
const selectedParam: Ref<string | undefined> = ref(undefined);
const selection: Ref<UserAccessRequest | undefined> = ref(undefined);
const users: Ref<Array<UserAccessRequest>> = ref([]);
const visible = defineModel<boolean>('visible');

// Actions
let cancelTokenSource: any = null;

const toast = useToast();

async function searchIdirUsers() {
  selection.value = undefined;
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
        .map(({ attributes, ...rest }: any) => ({
          ...rest,
          fullName: attributes?.display_name?.[0] as string,
          identityId: attributes?.idir_user_guid?.[0] as string
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
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6"
  >
    <template #header>
      <span class="p-dialog-title">Create new user</span>
    </template>
    <div class="flex justify-content-between align-items-center">
      <div class="col-9 mb-2">
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchTag"
            placeholder="Search by first name, last name, or email"
            class="col-12 pl-5"
            @update:model-value="searchIdirUsers"
          />
        </IconField>
      </div>
      <Dropdown
        class="col-3 m-0"
        name="assignRole"
        placeholder="First name"
        :options="Object.values(USER_SEARCH_PARAMS)"
        @on-change="
          (param: DropdownChangeEvent) => {
            selectedParam = param.value;
            searchIdirUsers();
          }
        "
      />
    </div>
    <DataTable
      v-model:selection="selection"
      :row-hover="true"
      :loading="loading"
      class="datatable mt-3 mb-2 pl-2 pr-2"
      :value="users"
      selection-mode="single"
      data-key="username"
      :rows="5"
      :paginator="true"
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
        field="username"
        header="Username"
        sortable
      >
        <template #body="{ data }">
          {{ data.fullName }}
        </template>
      </Column>
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
    <Dropdown
      class="col-12"
      name="assignRole"
      label="Assign role"
      :options="[GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY]"
      :disabled="!selection"
      @on-change="(e: DropdownChangeEvent) => (selectedRole = e.value)"
    />
    <div class="flex-auto pl-2">
      <Button
        class="mr-2"
        label="Request approval"
        type="submit"
        icon="pi pi-check"
        :disabled="!selection || !selectedRole"
        @click="
          () => {
            emit('userCreate:request', selection, selectedRole);
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
