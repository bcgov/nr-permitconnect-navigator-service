<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { InputText } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'RelatedEnquiriesSection', tab);
</script>

<template>
  <div
    ref="formRef"
    class="bg-[var(--p-bcblue-50)] rounded px-9 py-6"
  >
    <h4 class="section-header mb-4 mt-0">
      {{ t('i.housing.project.projectForm.relatedEnquiries') }}
    </h4>
    <InputText
      name="relatedEnquiries"
      :label="t('i.housing.project.projectForm.relatedEnquiriesLabel')"
      :disabled="true"
    />
  </div>
</template>
