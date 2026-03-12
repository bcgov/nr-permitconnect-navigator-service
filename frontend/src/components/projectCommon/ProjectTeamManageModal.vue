<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button, Dialog, Message, Select } from '@/lib/primevue';
import { useAppStore } from '@/store';
import { ACTIVITY_CONTACT_ROLE_LIST } from '@/utils/constants/projectCommon';
import { ActivityContactRole } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';
import type { ActivityContact } from '@/types';

// Props
const { activityContact = undefined } = defineProps<{
  activityContact?: ActivityContact;
}>();

// Emits
const emit = defineEmits(['projectTeamManageModal:manageUser']);

// Composables
const { t } = useI18n();

// Store
const appStore = useAppStore();
const { isInternal } = storeToRefs(appStore);

// State
const selectedRole: Ref<ActivityContactRole | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');

const selectableRoles = computed(() => {
  if (isInternal.value) {
    return ACTIVITY_CONTACT_ROLE_LIST.filter((role) => role !== activityContact?.role);
  } else {
    return ACTIVITY_CONTACT_ROLE_LIST.filter(
      (role) => role !== ActivityContactRole.PRIMARY && role !== activityContact?.role
    );
  }
});

// Actions
watch(visible, () => {
  selectedRole.value = undefined;
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
      <span class="p-dialog-title">{{ t('projectTeamManageModal.header') }}</span>
    </template>
    <Message
      v-if="selectedRole === ActivityContactRole.ADMIN"
      severity="warn"
      class="text-center mb-8"
    >
      {{ t('projectTeamManageModal.adminSelectedWarning') }}
    </Message>
    <h5 class="mb-3">{{ activityContact?.contact?.firstName }} {{ activityContact?.contact?.lastName }}</h5>
    <label
      id="assignRole-label"
      for="assignRole"
      class="font-bold"
    >
      {{ t('projectTeamManageModal.role') }}
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
        :label="t('projectTeamManageModal.save')"
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
        :label="t('projectTeamManageModal.cancel')"
        icon="pi pi-times"
        @click="visible = false"
      />
    </div>
  </Dialog>
</template>
