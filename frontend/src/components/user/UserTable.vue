<script setup lang="ts">
import { ref } from 'vue';

import { Button, Column, DataTable } from '@/lib/primevue';
import { AccessRequestStatus } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Group, UserAccessRequest } from '@/types';

// Props
const { usersAndAccessRequests, requestTable = false } = defineProps<{
  usersAndAccessRequests: Array<UserAccessRequest>;
  requestTable?: boolean;
}>();

// Constants
const DEFAULT_SORT_ORDER = 1;
const DEFAULT_SORT_FIELD = 'fullName';

// Emits
const emit = defineEmits(['userTable:approveRequest', 'userTable:denyRequest', 'userTable:manage', 'userTable:revoke']);

// State
const selection: Ref<UserAccessRequest | undefined> = ref(undefined);

function getStatusClass(data: UserAccessRequest) {
  let statusClass = 'default-status';
  if (data.accessRequest && data.user.status !== AccessRequestStatus.APPROVED) {
    statusClass = data.accessRequest.grant ? 'pending-approval-status' : 'pending-revoke-status';
  }
  return statusClass;
}
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :row-hover="true"
    class="datatable"
    :value="usersAndAccessRequests"
    removable-sort
    selection-mode="single"
    :sort-field="DEFAULT_SORT_FIELD"
    :sort-order="DEFAULT_SORT_ORDER"
  >
    <template #empty>
      <div class="flex justify-center">
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
    >
      <template #body="{ data }">
        <span :class="getStatusClass(data)">
          {{ data.user.status }}
        </span>
      </template>
    </Column>
    <Column
      field="role"
      header="Role"
      sortable
    >
      <template #body="{ data }">
        {{
          data.user.groups?.length ? data.user.groups.map((x: Group) => x.label).join() : data.accessRequest?.groupLabel
        }}
      </template>
    </Column>
    <Column
      v-if="!requestTable"
      field="manage"
      header="Manage"
      header-class="header-right"
      class="!text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-0"
          aria-label="Manage user"
          :disabled="data.accessRequest?.status === AccessRequestStatus.PENDING"
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
      v-if="!requestTable"
      field="revoke"
      header="Revoke"
      header-class="header-right"
      class="!text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0"
          aria-label="Revoke user"
          :disabled="data.accessRequest?.status === AccessRequestStatus.PENDING"
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
    <Column
      v-if="requestTable"
      field="approve"
      header="Approve"
      header-class="header-right"
      class="!text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-0"
          aria-label="Approve request"
          @click="
            () => {
              selection = data;
              emit('userTable:approveRequest', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-check-to-slot" />
        </Button>
      </template>
    </Column>
    <Column
      v-if="requestTable"
      field="deny"
      header="Deny"
      header-class="header-right"
      class="!text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0"
          aria-label="Deny request"
          @click="
            () => {
              selection = data;
              emit('userTable:denyRequest', data);
            }
          "
        >
          <font-awesome-icon icon="fa-solid fa-circle-xmark" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped lang="scss">
.default-status {
  color: black;
}

.pending-approval-status {
  color: $app-primary;
}

.pending-revoke-status {
  color: $app-error;
}
</style>
