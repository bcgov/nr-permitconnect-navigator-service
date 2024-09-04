<script setup lang="ts">
import { ref } from 'vue';

import { Button, Column, DataTable } from '@/lib/primevue';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { AccessRequestStatus } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { UserAccessRequest } from '@/types';

// Constants
const DEFAULT_SORT_ORDER = 1;
const DEFAULT_SORT_FIELD = 'fullName';
const PENDING_STATUSES = {
  PENDING_APPROVAL: 'Pending Approval',
  PENDING_REVOCATION: 'Pending Revocation'
};

// Props
type Props = {
  usersAndAccessRequest: Array<UserAccessRequest>;
  revocation?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  revocation: false
});

// Emits
const emit = defineEmits([
  'userTable:processRequest',
  'userTable:denyRevocation',
  'userTable:delete',
  'userTable:manage',
  'userTable:revoke'
]);

// Store
const authzStore = useAuthZStore();

// State
const selection: Ref<UserAccessRequest | undefined> = ref(undefined);
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :row-hover="true"
    class="datatable"
    :value="props.usersAndAccessRequest"
    selection-mode="single"
    :sort-field="DEFAULT_SORT_FIELD"
    :sort-order="DEFAULT_SORT_ORDER"
  >
    <template #empty>
      <div class="flex justify-content-center">
        <h5 class="m-0">No users found.</h5>
      </div>
    </template>
    <Column
      field="user.fullName"
      header="Username"
      sortable
    />
    <Column
      field="user.firstName"
      header="First Name"
      sortable
    />
    <Column
      field="user.lastName"
      header="Last Name"
      sortable
    />
    <Column
      field="user.status"
      header="Status"
      sortable
    />
    <Column
      field="role"
      header="Role"
      sortable
    >
      <template #body="{ data }">
        {{ data.user.groups?.length ? data.user.groups.join(', ') : data.accessRequest?.group }}
      </template>
    </Column>
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
          class="p-button-lg p-button-text p-0 mr-3"
          aria-label="Manage user"
          :disabled="revocation || data.accessRequest?.status === AccessRequestStatus.PENDING"
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
      v-if="!revocation && authzStore.canNavigate(NavigationPermission.HOUSING_USER_MANAGEMENT_ADMIN)"
      field="approve/deny"
      header="Approve/Deny"
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-0 mr-3"
          aria-label="Approve/Deny user"
          :disabled="revocation || data.user.status === AccessRequestStatus.APPROVED"
          @click="
            () => {
              emit('userTable:processRequest', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-check-to-slot" />
        </Button>
      </template>
    </Column>
    <Column
      v-if="revocation"
      field="deny"
      header="Deny"
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0 mr-3"
          aria-label="Deny revoke request"
          @click="
            () => {
              selection = data;
              emit('userTable:denyRevocation', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-circle-xmark" />
        </Button>
      </template>
    </Column>
    <Column
      field="revoke"
      header="Revoke"
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0 mr-3"
          aria-label="Revoke user"
          :disabled="!revocation && data.accessRequest?.status === AccessRequestStatus.PENDING"
          @click="
            () => {
              selection = data;
              emit('userTable:revoke', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-user-xmark" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
