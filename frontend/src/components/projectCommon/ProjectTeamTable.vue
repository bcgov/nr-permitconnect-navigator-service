<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, Column, DataTable } from '@/lib/primevue';
import { useAppStore, useContactStore } from '@/store';
import { Zone } from '@/utils/enums/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { ActivityContact } from '@/types';
import { ACTIVITY_CONTACT_ROLE_LIST } from '@/utils/constants/projectCommon';

// Types
type TeamAction = 'manage' | 'revoke';

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
const currentUserActivityContact = computed(() =>
  activityContacts.find((ac) => ac.contactId === getContact.value?.contactId)
);
const isAdmin = computed(() => {
  const adminRoles: ActivityContactRole[] = ACTIVITY_CONTACT_ROLE_LIST.filter((r) => r !== ActivityContactRole.MEMBER);
  return currentUserActivityContact.value && adminRoles.includes(currentUserActivityContact.value.role);
});

// Actions
function isManageable(activityContact: ActivityContact, action: TeamAction) {
  const isSelf = activityContact.contactId === currentUserActivityContact.value?.contactId;

  // Cannot manage or revoke a primary contact
  if (activityContact.role === ActivityContactRole.PRIMARY) return false;

  // Cannot revoke self
  if (action === 'revoke' && isSelf) return false;

  // Manual entry members (non users) are locked for manage.
  const isManualMember = activityContact.role === ActivityContactRole.MEMBER && !activityContact.contact?.userId;
  if (isManualMember && action === 'manage') return false;

  // Manageable if internal OR not self
  return getZone.value === Zone.INTERNAL || !isSelf;
}
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
          :disabled="!isManageable(data, 'manage')"
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
          :disabled="!isManageable(data, 'revoke')"
          @click="emit('projectTeamTable:revokeUser', data)"
        >
          <font-awesome-icon icon="fa-solid fa-user-xmark" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
