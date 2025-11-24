<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, Column, DataTable } from '@/lib/primevue';
import { useContactStore } from '@/store';
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

// State
const isAdmin: Ref<boolean> = ref(false);

// Actions
watchEffect(() => {
  // Determine if the current user has admin privileges
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
        <h5 class="m-0">{{ t('e.common.projectTeamTable.noUsers') }}</h5>
      </div>
    </template>
    <Column
      field="contact.firstName"
      :header="t('e.common.projectTeamTable.headerFirstName')"
      sortable
    />
    <Column
      field="contact.lastName"
      :header="t('e.common.projectTeamTable.headerLastName')"
      sortable
    />
    <Column
      field="contact.email"
      :header="t('e.common.projectTeamTable.headerEmail')"
      sortable
    />
    <Column
      field="contact.phoneNumber"
      :header="t('e.common.projectTeamTable.headerPhone')"
      sortable
    />
    <Column
      field="role"
      :header="t('e.common.projectTeamTable.headerRole')"
      sortable
    />
    <Column
      v-if="isAdmin"
      field="manage"
      :header="t('e.common.projectTeamTable.headerManage')"
      header-class="header-right"
      class="!text-right"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-0"
          :aria-label="t('e.common.projectTeamTable.headerManage')"
          :disabled="
            data.role === ActivityContactRole.PRIMARY || data.contactId === useContactStore().getContact?.contactId
          "
          @click="emit('projectTeamTable:manageUser', data)"
        >
          <font-awesome-icon icon="fa-solid fa-pen-to-square" />
        </Button>
      </template>
    </Column>
    <Column
      v-if="isAdmin"
      field="revoke"
      :header="t('e.common.projectTeamTable.headerRevoke')"
      header-class="header-right"
      class="!text-right"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0"
          :aria-label="t('e.common.projectTeamTable.headerRevoke')"
          :disabled="
            data.role === ActivityContactRole.PRIMARY || data.contactId === useContactStore().getContact?.contactId
          "
          @click="emit('projectTeamTable:revokeUser', data)"
        >
          <font-awesome-icon icon="fa-solid fa-user-xmark" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
