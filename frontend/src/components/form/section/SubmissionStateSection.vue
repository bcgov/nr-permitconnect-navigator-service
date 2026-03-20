<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { EditableSelect, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { userService } from '@/services';
import { useFormStore, useProjectStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { APPLICATION_STATUS_LIST, QUEUE_PRIORITY, SUBMISSION_TYPE_LIST } from '@/utils/constants/projectCommon';
import { IdentityProviderKind, Regex } from '@/utils/enums/application';
import { findIdpConfig } from '@/utils/utils';

import type { ComponentPublicInstance, Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { User } from '@/types';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const { getEditable } = storeToRefs(useFormStore());
const { getProject } = storeToRefs(useProjectStore());

// State
const assigneeOptions: Ref<User[]> = ref([]);
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'SubmissionStateSection', tab);

const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName}`;
};

const onAssigneeInput = async (e: IInputEvent) => {
  const input = e.target.value;

  const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);

  if (idpCfg) {
    if (input.length >= MIN_SEARCH_INPUT_LENGTH) {
      assigneeOptions.value = (
        await userService.searchUsers({ email: input, fullName: input, idp: [idpCfg.idp] })
      ).data;
    } else if (input.match(Regex.EMAIL)) {
      assigneeOptions.value = (await userService.searchUsers({ email: input, idp: [idpCfg.idp] })).data;
    } else {
      assigneeOptions.value = [];
    }
  }
};

onBeforeMount(async () => {
  if (getProject.value?.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [getProject.value?.assignedUserId] })).data;
  }
});
</script>

<template>
  <div
    ref="formRef"
    class="bg-[var(--p-bcblue-50)] rounded px-9 py-6"
  >
    <h4 class="section-header mb-4 mt-0">
      {{ t('i.housing.project.projectForm.submissionStateHeader') }}
    </h4>
    <div class="flex flex-col gap-y-4">
      <EditableSelect
        name="submissionState.assignedUser"
        :label="t('i.housing.project.projectForm.assignedToLabel')"
        :disabled="!getEditable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="onAssigneeInput"
      />
      <Select
        name="submissionState.applicationStatus"
        :label="t('i.housing.project.projectForm.projectStateLabel')"
        :disabled="!getEditable"
        :options="APPLICATION_STATUS_LIST"
      />

      <Select
        name="submissionState.submissionType"
        :label="t('i.housing.project.projectForm.submissionTypeLabel')"
        :disabled="!getEditable"
        :options="SUBMISSION_TYPE_LIST"
      />
      <Select
        name="submissionState.queuePriority"
        :label="t('i.housing.project.projectForm.priorityLabel')"
        :disabled="!getEditable"
        :options="QUEUE_PRIORITY"
      />
    </div>
  </div>
</template>
