<script setup lang="ts">
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProjectTeamTable from './ProjectTeamTable.vue';
import ProjectTeamAddModal from './ProjectTeamAddModal.vue';
import ProjectTeamManageModal from './ProjectTeamManageModal.vue';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { activityContactService, contactService } from '@/services';
import { useAppStore, useProjectStore } from '@/store';
import { Zone } from '@/utils/enums/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact, Contact } from '@/types';

// Props
const { activityId } = defineProps<{
  activityId: string;
}>();

// Composables
const confirm = useConfirm();
const { t } = useI18n();
const toast = useToast();

// Store
const appStore = useAppStore();
const projectStore = useProjectStore();
const { getZone } = storeToRefs(appStore);
const { getActivityContacts } = storeToRefs(projectStore);

// State
const addUserModalVisible: Ref<boolean> = ref(false);
const manageUserModalVisible: Ref<boolean> = ref(false);
const selectedContact: Ref<ActivityContact | undefined> = ref(undefined);

const isInternal = computed(() => getZone.value === Zone.INTERNAL);

// Actions
async function onAddUser(contact: Contact, role: ActivityContactRole) {
  try {
    const response = (await activityContactService.createActivityContact(activityId, contact.contactId, role)).data;
    switch (role) {
      case ActivityContactRole.ADMIN:
        toast.success(t('projectTeamTab.oneAdminAdded', firstLastNames));
        break;
      case ActivityContactRole.MEMBER:
        toast.success(t('projectTeamTab.oneMemberAdded', firstLastNames));
        break;
      case ActivityContactRole.PRIMARY:
        toast.success(t('projectTeamTab.onePrimaryAdded', firstLastNames));
        break;

    // Update store
    projectStore.addActivityContact(response);

    if (role === ActivityContactRole.ADMIN)
    } catch (error) {
      let errorMessage = t('projectTeamTab.failedToAddGeneric');

      if (isAxiosError(error)) {
        if (error.response?.data?.type === 'P2002') {
          errorMessage = t('projectTeamTab.userAlreadyExists');
        } else {
          errorMessage = error.response?.data?.message ?? error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }


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

    const firstLastNames = { first: contact.contact?.firstName, last: contact.contact?.lastName };

    switch (role) {
      case ActivityContactRole.ADMIN:
        toast.success(t('projectTeamTab.adminUpdated', firstLastNames));
        break;
      case ActivityContactRole.MEMBER:
        toast.success(t('projectTeamTab.memberUpdated', firstLastNames));
        break;
      case ActivityContactRole.PRIMARY:
        toast.success(t('projectTeamTab.primaryUpdated', firstLastNames));
        break;
    }
  } catch (error) {
    if (isAxiosError(error))
      toast.error(t('projectTeamTab.failedToUpdate'), error.response?.data?.message ?? error.message);
    else if (error instanceof Error) toast.error(t('projectTeamTab.failedToUpdate'), error.message);
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
      t('projectTeamTab.memberRevoked', {
        first: contact.contact?.firstName,
        last: contact.contact?.lastName
      })
    );
  } catch (error) {
    if (isAxiosError(error))
      toast.error(t('projectTeamTab.failedToRevoke'), error.response?.data?.message ?? error.message);
    else if (error instanceof Error) toast.error(t('projectTeamTab.failedToRevoke'), error.message);
  }
}

function onRevokeUserClick(contact: ActivityContact) {
  confirm.require({
    message: t('projectTeamTab.revokeDesc', {
      first: contact.contact?.firstName,
      last: contact.contact?.lastName
    }),
    header: t('projectTeamTab.revokeHeader'),
    acceptLabel: t('projectTeamTab.revoke'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('projectTeamTab.cancel'),
    rejectProps: { outlined: true },
    accept: () => {
      onRevokeUser(contact);
    }
  });
}

onBeforeMount(() => {
  const hasPrimaryContact = getActivityContacts.value.some((ac) => ac.role === ActivityContactRole.PRIMARY);

  addUserModalVisible.value = !hasPrimaryContact && isInternal.value;
});
</script>

<template>
  <div class="flex flex-row items-center disclaimer-block p-8 mt-4 mb-8">
    <div class="basis-5/6">
      {{ isInternal ? t('projectTeamTab.projectTeamDescNav') : t('projectTeamTab.projectTeamDescProp') }}
    </div>
    <div class="basis-1/6">
      <div class="flex justify-end">
        <Button
          :label="isInternal ? t('projectTeamTab.addUserBtn') : t('projectTeamTab.addMemberBtn')"
          icon="pi pi-plus"
          outlined
          @click="addUserModalVisible = true"
        />
      </div>
    </div>
  </div>
  <div v-if="getActivityContacts">
    <ProjectTeamTable
      :activity-contacts="getActivityContacts"
      @project-team-table:manage-user="onManageUserClick"
      @project-team-table:revoke-user="onRevokeUserClick"
    />
    <ProjectTeamAddModal
      v-model:visible="addUserModalVisible"
      :activity-contacts="getActivityContacts"
      @project-team-add-modal:add-user="onAddUser"
    />
    <ProjectTeamManageModal
      v-model:visible="manageUserModalVisible"
      :activity-contact="selectedContact"
      @project-team-manage-modal:manage-user="onManageUser"
    />
  </div>
</template>
