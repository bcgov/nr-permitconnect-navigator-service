<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import { Button, Column, DataTable } from '@/lib/primevue';
import { useContactStore } from '@/store';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact } from '@/types';

// Props
const { activityContacts } = defineProps<{
  activityContacts: ActivityContact[];
}>();

// State
const isAdmin: Ref<boolean> = ref(false);

// Actions
watchEffect(async () => {
  // Determine if the current user has admin priviledges
  const userActivityRole = activityContacts.find((x) => x.contactId === useContactStore().getContact?.contactId)?.role;
  if (userActivityRole)
    isAdmin.value = [ActivityContactRole.PRIMARY, ActivityContactRole.ADMIN].includes(userActivityRole);
});
</script>

<template>
  <DataTable
    :value="activityContacts"
    class="datatable"
    removable-sort
  >
    <template #empty>
      <div class="flex justify-center">
        <h5 class="m-0">No users found.</h5>
      </div>
    </template>
    <Column
      field="contact.firstName"
      header="First Name"
      sortable
    />
    <Column
      field="contact.lastName"
      header="Last Name"
      sortable
    />
    <Column
      field="contact.email"
      header="Email"
      sortable
    />
    <Column
      field="contact.phoneNumber"
      header="Phone"
      sortable
    />
    <Column
      field="role"
      header="Role"
      sortable
    />
    <Column
      v-if="isAdmin"
      field="manage"
      header="Manage"
      header-class="header-right"
      class="!text-right"
    >
      <template #body>
        <Button
          class="p-button-lg p-button-text p-0"
          aria-label="Manage"
        >
          <font-awesome-icon icon="fa-solid fa-pen-to-square" />
        </Button>
      </template>
    </Column>
    <Column
      v-if="isAdmin"
      field="revoke"
      header="Revoke"
      header-class="header-right"
      class="!text-right"
    >
      <template #body>
        <Button
          class="p-button-lg p-button-text p-button-danger p-0"
          aria-label="Revoke"
        >
          <font-awesome-icon icon="fa-solid fa-user-xmark" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
