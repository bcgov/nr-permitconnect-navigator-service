<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, Column, DataTable } from '@/lib/primevue';
import { useAppStore, useContactStore } from '@/store';
import { Zone } from '@/utils/enums/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact } from '@/types';

// Props
const { activityContacts } = defineProps<{
  activityContacts: ActivityContact[];
}>();

// Composables
const { t } = useI18n();

// Emits
const emit = defineEmits(['projectTeamTable:manageUser', 'projectTeamTable:revokeUser']);

// Store
const appStore = useAppStore();
const contactStore = useContactStore();
const { getZone } = storeToRefs(appStore);
const { getContact } = storeToRefs(contactStore);

// State
const isAdmin: Ref<boolean> = ref(false);

// Actions
watchEffect(() => {
  // Determine if the current user has admin privileges
  const userActivityRole = activityContacts.find((x) => x.contactId === getContact.value?.contactId)?.role;
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
        <h5 class="m-0">{{ t('projectTeamTable.noUsers') }}</h5>
      </div>
    </template>
    <Column
      v-if="getZone === Zone.INTERNAL"
      field="userId"
    >
      <template #body="{ data }">
        <font-awesome-icon
          v-if="data.contact.userId"
          icon="fa-solid fa-user"
          class="app-primary-color"
        />
      </template>
    </Column>
    <Column
      field="contact.firstName"
      :header="t('projectTeamTable.headerFirstName')"
      sortable
    />
    <Column
      field="contact.lastName"
      :header="t('projectTeamTable.headerLastName')"
      sortable
    />
    <Column
      field="contact.contactApplicantRelationship"
      :header="t('projectTeamTable.headerRelationship')"
      sortable
    />
    <Column
      field="contact.email"
      :header="t('projectTeamTable.headerEmail')"
      sortable
    />
    <Column
      field="contact.phoneNumber"
      :header="t('projectTeamTable.headerPhone')"
      sortable
    />
    <Column
      field="role"
      :header="t('projectTeamTable.headerRole')"
      sortable
    />
    <Column
      v-if="isAdmin"
      field="manage"
      :header="t('projectTeamTable.headerManage')"
      header-class="header-right"
      class="!text-right"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-0"
          :aria-label="t('projectTeamTable.headerManage')"
          :disabled="data.role === ActivityContactRole.PRIMARY || data.contactId === getContact?.contactId"
          @click="emit('projectTeamTable:manageUser', data)"
        >
          <font-awesome-icon icon="fa-solid fa-pen-to-square" />
        </Button>
      </template>
    </Column>
    <Column
      v-if="isAdmin"
      field="revoke"
      :header="t('projectTeamTable.headerRevoke')"
      header-class="header-right"
      class="!text-right"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0"
          :aria-label="t('projectTeamTable.headerRevoke')"
          :disabled="data.role === ActivityContactRole.PRIMARY || data.contactId === getContact?.contactId"
          @click="emit('projectTeamTable:revokeUser', data)"
        >
          <font-awesome-icon icon="fa-solid fa-user-xmark" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
