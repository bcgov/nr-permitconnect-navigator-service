<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Checkbox } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { useAppStore, useFormStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const { getInitiative } = storeToRefs(useAppStore());
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
      v-if="getInitiative !== Initiative.GENERAL"
      name="projectAreasUpdated.addedToAts"
      class="mb-4"
      :label="t('i.housing.project.projectForm.atsUpdated')"
      :disabled="!getEditable"
    />
    <Checkbox
      v-if="getInitiative === Initiative.HOUSING"
      class="col-span-12 mb-4"
      name="projectAreasUpdated.ltsaCompleted"
      :label="t('i.housing.project.projectForm.ltsaCompleted')"
      :disabled="!getEditable"
    />
    <Checkbox
      v-if="getInitiative === Initiative.HOUSING"
      class="col-span-12 mb-4"
      name="projectAreasUpdated.bcOnlineCompleted"
      :label="t('i.housing.project.projectForm.bcOnlineCompleted')"
      :disabled="!getEditable"
    />
    <Checkbox
      name="projectAreasUpdated.aaiUpdated"
      :label="t('i.housing.project.projectForm.aaiUpdateLabel')"
      :disabled="!getEditable"
    />
  </div>
</template>
