<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { useFormStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const { getEditable } = storeToRefs(useFormStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'FeedbackConsentSection', tab);
</script>

<template>
  <div
    ref="formRef"
    class="bg-[var(--p-bcblue-50)] rounded px-9 py-6"
  >
    <h4 class="section-header mb-4 mt-0">
      {{ t('i.housing.project.projectForm.feedbackConsent') }}
    </h4>
    <Select
      class="col-span-3"
      name="consentToFeedback"
      :label="t('i.housing.project.projectForm.researchOptin')"
      :disabled="!getEditable"
      :options="YES_NO_LIST"
    />
  </div>
</template>
