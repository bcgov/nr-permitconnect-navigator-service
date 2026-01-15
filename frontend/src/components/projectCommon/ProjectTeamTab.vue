<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, useConfirm, useToast } from '@/lib/primevue';
import ProjectTeamTable from './ProjectTeamTable.vue';
import ProjectTeamAddModal from './ProjectTeamAddModal.vue';
import ProjectTeamManageModal from './ProjectTeamManageModal.vue';
import { activityContactService } from '@/services';
import { useProjectStore } from '@/store';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact, Contact } from '@/types';
import { isAxiosError } from 'axios';

// Props
const { activityId } = defineProps<{
  activityId: string;
}>();

// Composables
const confirm = useConfirm();
const { t } = useI18n();
const projectStore = useProjectStore();
const toast = useToast();

// State
const createUserModalVisible: Ref<boolean> = ref(false);
const manageUserModalVisible: Ref<boolean> = ref(false);
const selectedContact: Ref<ActivityContact | undefined> = ref(undefined);

// Actions
async function onAddUser(contact: Contact, role: ActivityContactRole) {
  try {
    const response = (await activityContactService.createActivityContact(activityId, contact.contactId, role)).data;

    // Update store
    projectStore.addActivityContact(response);

    if (role === ActivityContactRole.ADMIN)
      toast.success(
        t('e.common.projectTeamTab.adminAdded', {
          first: response.contact?.firstName,
          last: response.contact?.lastName
        })
      );
    else
      toast.success(
        t('e.common.projectTeamTab.memberAdded', {
          first: response.contact?.firstName,
          last: response.contact?.lastName
        })
      );

    // Close modal on success
    createUserModalVisible.value = false;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.data?.type === 'P2002') toast.error(t('e.common.projectTeamTab.userAlreadyExists'));
      else toast.error(t('e.common.projectTeamTab.failedToAdd'), error.response?.data?.message ?? error.message);
    } else if (error instanceof Error) toast.error(t('e.common.projectTeamTab.failedToAdd'), String(error.message));
  }
}

async function onManageUser(contact: ActivityContact, role: ActivityContactRole) {
  try {
    const response = (await activityContactService.updateActivityContact(activityId, contact.contactId, role)).data;

    // Update store
    projectStore.updateActivityContact(response);

    // Close modal on success
    manageUserModalVisible.value = false;
  } catch (error) {
    if (isAxiosError(error))
      toast.error(t('e.common.projectTeamTab.failedToUpdate'), error.response?.data?.message ?? error.message);
    else if (error instanceof Error) toast.error(t('e.common.projectTeamTab.failedToUpdate'), error.message);
  }
}

function onManageUserClick(contact: ActivityContact) {
  selectedContact.value = contact;
  manageUserModalVisible.value = true;
}

async function onRevokeUser(contact: ActivityContact) {
  try {
    await activityContactService.deleteActivityContact(activityId, contact.contactId);

    // Update store
    projectStore.removeActivityContact(contact);

    toast.success(
      t('e.common.projectTeamTab.memberRevoked', {
        first: contact.contact?.firstName,
        last: contact.contact?.lastName
      })
    );
  } catch (error) {
    if (isAxiosError(error))
      toast.error(t('e.common.projectTeamTab.failedToRevoke'), error.response?.data?.message ?? error.message);
    else if (error instanceof Error) toast.error(t('e.common.projectTeamTab.failedToRevoke'), error.message);
  }
}

function onRevokeUserClick(contact: ActivityContact) {
  confirm.require({
    message: t('e.common.projectTeamTab.revokeDesc', {
      first: contact.contact?.firstName,
      last: contact.contact?.lastName
    }),
    header: t('e.common.projectTeamTab.revokeHeader'),
    acceptLabel: t('e.common.projectTeamTab.revoke'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('e.common.projectTeamTab.cancel'),
    rejectProps: { outlined: true },
    accept: () => {
      onRevokeUser(contact);
    }
  });
}
</script>

<template>
  <div class="flex flex-row disclaimer-block p-8 mt-4 mb-8">
    <div class="basis-5/6">
      {{ t('e.common.projectTeamTab.projectTeamDesc') }}
    </div>
    <div class="basis-1/6">
      <div class="flex justify-end">
        <Button
          :label="t('e.common.projectTeamTab.addMemberBtn')"
          icon="pi pi-plus"
          outlined
          @click="createUserModalVisible = true"
        />
      </div>
    </div>
  </div>
  <div v-if="projectStore.getActivityContacts">
    <ProjectTeamTable
      :activity-contacts="projectStore.getActivityContacts"
      @project-team-table:manage-user="onManageUserClick"
      @project-team-table:revoke-user="onRevokeUserClick"
    />
    <ProjectTeamAddModal
      v-model:visible="createUserModalVisible"
      :activity-contacts="projectStore.getActivityContacts"
      @project-team-add-modal:add-user="onAddUser"
    />
    <ProjectTeamManageModal
      v-model:visible="manageUserModalVisible"
      :activity-contact="selectedContact"
      @project-team-manage-modal:manage-user="onManageUser"
    />
  </div>
</template>
