<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { EditableSelect, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { useUserSearch } from '@/composables/useUserSearch';
import { useAppStore, useFormStore, useProjectStore } from '@/store';
import {
  APPLICATION_STATUS_LIST,
  AREA_LIST,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST,
  QUEUE_PRIORITY,
  REGION_LIST,
  SUBMISSION_TYPE_LIST
} from '@/utils/constants/projectCommon';
import { Initiative } from '@/utils/enums/application';

import type { ComponentPublicInstance, Ref } from 'vue';
import type { User } from '@/types';

// Props
const { tab = 0, isEnquiry = false } = defineProps<{
  tab?: number;
  isEnquiry?: boolean;
}>();

// Composables
const { t } = useI18n();
const assignee = useUserSearch();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const { getEditable } = storeToRefs(useFormStore());
const { getProject } = storeToRefs(useProjectStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'SubmissionStateSection', tab);

const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName}`;
};

onMounted(async () => {
  const id = getProject.value?.assignedUserId;
  if (id) {
    await assignee.loadById(id);
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
        :options="assignee.users.value"
        :get-option-label="getAssigneeOptionLabel"
        data-key="userId"
        @on-input="async (e) => assignee.search(e.target.value)"
      />
      <span v-if="!isEnquiry">
        <Select
          v-if="getInitiative === Initiative.GENERAL"
          name="submissionState.region"
          :label="t('i.housing.project.projectForm.regionLabel')"
          :disabled="!getEditable"
          :options="REGION_LIST"
        />
        <Select
          v-if="getInitiative === Initiative.GENERAL"
          name="submissionState.area"
          :label="t('i.housing.project.projectForm.areaLabel')"
          :disabled="!getEditable"
          :options="AREA_LIST"
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
      </span>
      <span v-else>
        <EditableSelect
          name="submissionState.submittedMethod"
          :label="t('enquiryForm.submittedMethod')"
          :disabled="!getEditable"
          :options="ENQUIRY_SUBMITTED_METHOD"
          :get-option-label="(e: string) => e"
        />

        <Select
          name="submissionState.enquiryStatus"
          :label="t('enquiryForm.enquiryState')"
          :disabled="!getEditable"
          :options="APPLICATION_STATUS_LIST"
        />
        <Select
          name="submissionState.submissionType"
          :label="t('enquiryForm.submissionType')"
          :disabled="!getEditable"
          :options="ENQUIRY_TYPE_LIST"
        />
      </span>
    </div>
  </div>
</template>
