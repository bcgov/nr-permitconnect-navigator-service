<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, useToast } from '@/lib/primevue';
import ProjectTeamTable from './ProjectTeamTable.vue';
import ProjectTeamAddModal from './ProjectTeamAddModal.vue';
import { activityContactService } from '@/services';

import type { Ref } from 'vue';
import type { ActivityContact, Contact } from '@/types';
import type { ActivityContactRole } from '@/utils/enums/projectCommon';

// Props
const { activityId } = defineProps<{
  activityId: string;
}>();

// Composables
const { t } = useI18n();
const toast = useToast();

// State
const activityContacts: Ref<ActivityContact[]> = ref([]);
const createUserModalVisible: Ref<boolean> = ref(false); // Create user modal visible

// Actions
async function onAddUser(contact: Contact, role: ActivityContactRole) {
  try {
    await activityContactService.createActivityContact(activityId, contact.contactId, role);
    toast.success('User added to project');
  } catch (error: any) {
    if (error.response?.data?.type === 'P2002') toast.error('User already added to project');
    else toast.error('Failed to add user', error.response?.data?.message ?? error.message);
  }
}

onBeforeMount(async () => {
  activityContacts.value = (await activityContactService.listActivityContacts(activityId)).data;
});
</script>

<template>
  <div class="flex flex-row disclaimer-block p-8 mt-4 mb-8">
    <div class="basis-5/6">
      {{ t('e.common.projectTeamTab.projectTeamDesc') }}
    </div>
    <div class="basis-1/6">
      <div class="flex justify-center">
        <Button
          :label="t('e.common.projectTeamTab.addUserBtn')"
          icon="pi pi-plus"
          outlined
          @click="createUserModalVisible = true"
        />
      </div>
    </div>
  </div>
  <ProjectTeamTable :activity-contacts="activityContacts" />
  <ProjectTeamAddModal
    v-model:visible="createUserModalVisible"
    :activity-contacts="activityContacts"
    @project-team-add-modal:add-user="onAddUser"
  />
</template>
