<script setup lang="ts">
import { ref } from 'vue';
import { Button, Column, DataTable } from '@/lib/primevue';

import PermissionService, { Permissions } from '@/services/permissionService';

import type { Ref } from 'vue';
import type { User } from '@/types';

// Props
type Props = {
  users: Array<User>;
  revocation?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  users: undefined
});

// Constants
const USER_STATUS = {
  APPROVED: 'Approved'
};

// Emits
const emit = defineEmits(['userTable:delete', 'userTable:approve', 'userTable:manage', 'userTable:revoke']);

// State
const selection: Ref<User | undefined> = ref(undefined);

// Actions
const permissionService = new PermissionService();
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :row-hover="true"
    class="datatable"
    :value="props.users"
    selection-mode="single"
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
    <Column
      field="status"
      header="Status"
      sortable
    />
    <Column
      field="role"
      header="Role"
      sortable
    />
    <Column
      v-if="!revocation"
      field="manage"
      header="Manage"
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-0 pr-3"
          aria-label="Manage user"
          :disabled="revocation || data.status !== USER_STATUS.APPROVED"
          @click="
            () => {
              selection = data;
              emit('userTable:manage', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-pen-to-square" />
        </Button>
      </template>
    </Column>
    <Column
      v-if="!revocation && permissionService.can(Permissions.NAVIGATION_HOUSING_USER_MANAGEMENT_ADMIN)"
      field="approve"
      header="Approve"
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-0 pr-3"
          aria-label="Approve user"
          :disabled="revocation || data.status === USER_STATUS.APPROVED"
          @click="
            () => {
              selection = data;
              emit('userTable:approve', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-check-to-slot" />
        </Button>
      </template>
    </Column>
    <Column
      field="action"
      header="Action"
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0 pr-3"
          aria-label="Delete user"
          :disabled="data.status !== USER_STATUS.APPROVED"
          @click="
            () => {
              selection = data;
              permissionService.can(Permissions.NAVIGATION_HOUSING_USER_MANAGEMENT_ADMIN)
                ? emit('userTable:delete', data)
                : emit('userTable:revoke', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
