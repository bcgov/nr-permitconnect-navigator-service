<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import { Column, DataTable } from '@/lib/primevue';
import { activityContactService } from '@/services';
import { useContactStore } from '@/store';

import type { Ref } from 'vue';
import type { ActivityContact } from '@/types';

// Props
const { activityId } = defineProps<{
  activityId: string;
}>();

// State
const isAdmin: Ref<boolean> = ref(false);
const contacts: Ref<ActivityContact[]> = ref([]);

// Actions
onBeforeMount(async () => {
  contacts.value = (await activityContactService.listActivityContacts(activityId)).data;

  const userActivityRole = contacts.value.find((x) => x.contactId === useContactStore().getContact?.contactId)?.role;
  if (userActivityRole) isAdmin.value = ['PRIMARY', 'ADMIN'].includes(userActivityRole);
});
</script>

<template>
  <DataTable
    :value="contacts"
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
      <template #body="{ data }">
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
      <template #body="{ data }">
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
