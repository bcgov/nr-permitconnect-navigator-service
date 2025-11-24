<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, Dialog, Message, Select } from '@/lib/primevue';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact } from '@/types';

// Props
const { activityContact } = defineProps<{
  activityContact?: ActivityContact;
}>();

// Composables
const { t } = useI18n();
// Emits
const emit = defineEmits(['projectTeamManageModal:manageUser']);

// State
const selectedRole: Ref<ActivityContactRole | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');

const selectableRoles = [ActivityContactRole.ADMIN, ActivityContactRole.MEMBER];

// Actions
watchEffect(() => {
  selectedRole.value = activityContact?.role;
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6/12"
  >
    <template #header>
      <span class="p-dialog-title">{{ t('e.common.projectTeamManageModal.header') }}</span>
    </template>
    <Message
      v-if="selectedRole === ActivityContactRole.ADMIN"
      severity="warn"
      class="text-center mb-8"
    >
      {{ t('e.common.projectTeamManageModal.adminSelectedWarning') }}
    </Message>
    <h5 class="mb-3">{{ activityContact?.contact?.firstName }} {{ activityContact?.contact?.lastName }}</h5>
    <label
      id="assignRole-label"
      for="assignRole"
      class="font-bold"
    >
      {{ t('e.common.projectTeamManageModal.role') }}
    </label>
    <Select
      v-model="selectedRole"
      class="w-full"
      name="assignRole"
      :options="selectableRoles"
      :disabled="!activityContact"
    />
    <div class="mt-6">
      <Button
        class="mr-2"
        :label="t('e.common.projectTeamManageModal.save')"
        type="submit"
        icon="pi pi-check"
        :disabled="!activityContact || !selectedRole"
        @click="
          () => {
            emit('projectTeamManageModal:manageUser', activityContact, selectedRole);
          }
        "
      />
      <Button
        class="p-button-outlined mr-2"
        :label="t('e.common.projectTeamManageModal.cancel')"
        icon="pi pi-times"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
