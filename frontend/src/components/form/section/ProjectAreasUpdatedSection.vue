<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Checkbox } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { useFormStore } from '@/store';

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
useFormErrorWatcher(formRef, 'ProjectAreasUpdatedSection', tab);
</script>

<template>
  <div
    ref="formRef"
    class="bg-[var(--p-bcblue-50)] rounded px-9 py-6"
  >
    <h4 class="section-header mb-4 mt-0">
      {{ t('i.housing.project.projectForm.updatesHeader') }}
    </h4>
    <Checkbox
      name="addedToAts"
      class="mb-4"
      :label="t('i.housing.project.projectForm.atsUpdated')"
      :disabled="!getEditable"
    />
    <Checkbox
      class="col-span-12 mb-4"
      name="ltsaCompleted"
      :label="t('i.housing.project.projectForm.ltsaCompleted')"
      :disabled="!getEditable"
    />
    <Checkbox
      class="col-span-12 mb-4"
      name="bcOnlineCompleted"
      :label="t('i.housing.project.projectForm.bcOnlineCompleted')"
      :disabled="!getEditable"
    />
    <Checkbox
      name="aaiUpdated"
      :label="t('i.housing.project.projectForm.aaiUpdateLabel')"
      :disabled="!getEditable"
    />
  </div>
</template>
