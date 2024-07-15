<script setup lang="ts">
import { ref } from 'vue';
import { Button, Column, DataTable, Dialog, FilterMatchMode, IconField, InputIcon, InputText } from '@/lib/primevue';

import { Dropdown } from '@/components/form';
import { ROLES } from '@/utils/constants/application';

import type { Ref } from 'vue';
import type { User } from '@/types';

// Emits
const emit = defineEmits(['userCreate:request']);

// State
const visible = defineModel<boolean>('visible');
const users: Ref<Array<User>> = ref([]);
const selection: Ref<User | undefined> = ref(undefined);

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-5"
  >
    <template #header>
      <span class="p-dialog-title">Create new user</span>
    </template>
    <IconField
      icon-position="left"
      class="mt-1"
    >
      <InputIcon class="pi pi-search" />
      <InputText
        v-model="filters['global'].value"
        placeholder="Search by first name, last name, or email"
        class="col-12 pl-5"
      />
    </IconField>
    <DataTable
      v-model:selection="selection"
      v-model:filters="filters"
      :row-hover="true"
      class="datatable mt-3 mb-2"
      :value="users"
      selection-mode="single"
      data-key="userId"
    >
      <template #empty>
        <div class="flex justify-content-center">
          <h5 class="m-0">No users found.</h5>
        </div>
      </template>
      <Column
        field="username"
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
    </DataTable>
    <Dropdown
      class="col-12"
      name="assignRole"
      label="Assign role"
      :options="ROLES"
    />
    <div class="flex-auto">
      <Button
        class="mr-2"
        label="Request approval"
        type="submit"
        icon="pi pi-check"
        @click="
          () => {
            emit('userCreate:request', selection);
            visible = false;
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
