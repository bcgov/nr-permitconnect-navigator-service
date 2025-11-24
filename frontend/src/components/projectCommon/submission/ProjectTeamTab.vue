<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, useToast } from '@/lib/primevue';
import ProjectTeamTable from './ProjectTeamTable.vue';
import ProjectTeamAddModal from './ProjectTeamAddModal.vue';
import { activityContactService } from '@/services';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact, Contact } from '@/types';

// Props
const { activityId } = defineProps<{
  activityId: string;
}>();

const activityContacts = defineModel<ActivityContact[]>('activityContacts');

// Composables
const { t } = useI18n();
const toast = useToast();

// State
const createUserModalVisible: Ref<boolean> = ref(false); // Create user modal visible

// Actions
async function onAddUser(contact: Contact, role: ActivityContactRole) {
  try {
    const response = (await activityContactService.createActivityContact(activityId, contact.contactId, role)).data;
    activityContacts.value?.push(response);

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
  } catch (error: any) {
    if (error.response?.data?.type === 'P2002') toast.error(t('e.common.projectTeamTab.userAlreadyExists'));
    else toast.error(t('e.common.projectTeamTab.failedToAdd'), error.response?.data?.message ?? error.message);
  }
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
          :label="t('e.common.projectTeamTab.addUserBtn')"
          icon="pi pi-plus"
          outlined
          @click="createUserModalVisible = true"
        />
      </div>
    </div>
  </div>
  <span v-if="activityContacts">
    <ProjectTeamTable :activity-contacts="activityContacts" />
    <ProjectTeamAddModal
      v-model:visible="createUserModalVisible"
      :activity-contacts="activityContacts"
      @project-team-add-modal:add-user="onAddUser"
    />
  </span>
</template>
