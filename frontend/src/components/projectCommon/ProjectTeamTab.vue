<script setup lang="ts">
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProjectTeamTable from './ProjectTeamTable.vue';
import ProjectTeamAddModal from './ProjectTeamAddModal.vue';
import ProjectTeamManageModal from './ProjectTeamManageModal.vue';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { activityContactService, contactService } from '@/services';
import { useAppStore, useProjectStore } from '@/store';
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
const { isInternal } = storeToRefs(appStore);
const { getActivityContacts } = storeToRefs(projectStore);

// State
const addUserModalVisible: Ref<boolean> = ref(false);
const manageUserModalVisible: Ref<boolean> = ref(false);
const selectedContact: Ref<ActivityContact | undefined> = ref(undefined);

// Actions
function handleFailureToasts(failures: { contact: Contact; errorMessage: string }[]) {
  if (failures.length === 0) return;

  const [firstFailure] = failures;
  if (failures.length === 1 && firstFailure) {
    const { contact, errorMessage } = firstFailure;
    toast.error(
      t('projectTeamTab.singleFailedToAdd', {
        first: contact.firstName,
        last: contact.lastName,
        reason: errorMessage
      })
    );
  } else {
    const summary: Record<string, string[]> = {};

    // Build multiple failure toast message
    failures.forEach((f) => {
      const reason = f.errorMessage;
      const fullName = `${f.contact.firstName} ${f.contact.lastName}`;

      if (summary[reason]) summary[reason].push(fullName);
      else summary[reason] = [fullName];
    });

    const lines = Object.entries(summary).map(([reason, namesArray]) => {
      const names = namesArray.join(', ');
      return `- ${names}: ${reason}`;
    });

    toast.error([t('projectTeamTab.multipleFailedToAddHeader'), ...lines].join('\n'));
  }
}

function handleSuccessToasts(successes: { role: ActivityContactRole; contact: Contact }[]) {
  if (successes.length === 0) return;

  const [firstSuccess] = successes;
  if (successes.length === 1 && firstSuccess) {
    const { role, contact } = firstSuccess;
    const firstLastNames = { first: contact.firstName, last: contact.lastName };

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
    }
  } else {
    const summary: Record<ActivityContactRole, string[]> = {
      [ActivityContactRole.PRIMARY]: [],
      [ActivityContactRole.ADMIN]: [],
      [ActivityContactRole.MEMBER]: []
    };

    successes.forEach((s) => {
      summary[s.role].push(`${s.contact.firstName} ${s.contact.lastName}`);
    });

    const rolesWithContent = (Object.keys(summary) as ActivityContactRole[]).filter((role) => summary[role].length > 0);

    const lines = rolesWithContent.map((role) => {
      const names = summary[role].join(', ');
      const roleLower = role.toLowerCase();
      return t(`projectTeamTab.${roleLower}Added`, { names });
    });

    toast.success([t('projectTeamTab.usersAddedHeader'), ...lines].join('\n'));
  }
}

async function onAddUsers(contactsAndRoles: { contact: Contact; role: ActivityContactRole }[]) {
  const successes: { role: ActivityContactRole; contact: Contact }[] = [];
  const failures: { contact: Contact; errorMessage: string }[] = [];

  for (const cr of contactsAndRoles) {
    let contact = cr.contact;
    const role = cr.role;

    try {
      if (!contact.contactId) {
        contact = (await contactService.updateContact(contact)).data;
      }

      const response = (await activityContactService.createActivityContact(activityId, contact.contactId, role)).data;

      // Update store
      projectStore.addActivityContact(response);

      successes.push({ role, contact });
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

      failures.push({ contact, errorMessage });
    }
  }

  // Close modal any on successes
  if (successes.length > 0) {
    addUserModalVisible.value = false;
  }

  handleSuccessToasts(successes);
  handleFailureToasts(failures);
}

async function onManageUser(contact: ActivityContact, role: ActivityContactRole) {
  try {
    const { updated, demoted } = (
      await activityContactService.updateActivityContact(activityId, contact.contactId, role)
    ).data;

    // Update store
    projectStore.updateActivityContact(updated);
    if (demoted) projectStore.updateActivityContact(demoted);

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
        if (demoted) {
          toast.success(
            t('projectTeamTab.primaryUpdatedAndDemoted', {
              ...firstLastNames,
              firstDemoted: demoted.contact?.firstName,
              lastDemoted: demoted.contact?.lastName
            })
          );
        } else {
          toast.success(t('projectTeamTab.primaryUpdated', firstLastNames));
        }

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
      @project-team-add-modal:add-users="onAddUsers"
    />
    <ProjectTeamManageModal
      v-model:visible="manageUserModalVisible"
      :activity-contact="selectedContact"
      @project-team-manage-modal:manage-user="onManageUser"
    />
  </div>
</template>
