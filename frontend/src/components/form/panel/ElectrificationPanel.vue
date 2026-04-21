<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Electrification } from '@/components/common/icons';
import { InputText, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Panel } from '@/lib/primevue';
import { useCodeStore, useFormStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const { options } = useCodeStore();
const { getEditable } = storeToRefs(useFormStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'ElectrificationPanel', tab);
</script>

<template>
  <Panel
    ref="formRef"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2.5">
        <Electrification />
        <h3 class="section-header m-0">
          {{ t('i.electrification.projectForm.projectHeader') }}
        </h3>
      </div>
    </template>
    <div class="grid grid-cols-3 gap-x-6 gap-y-6">
      <Select
        name="electrification.projectType"
        option-label="label"
        option-value="value"
        :label="t('i.electrification.projectForm.projectTypeLabel')"
        :disabled="!getEditable"
        :options="options.ElectrificationProjectType"
      />
      <InputText
        name="electrification.bcHydroNumber"
        :label="t('i.electrification.projectForm.bcHydroNumberLabel')"
        :disabled="!getEditable"
      />
      <Select
        name="electrification.hasEpa"
        :label="t('i.electrification.projectForm.hasEpaLabel')"
        :disabled="!getEditable"
        :options="YES_NO_LIST"
      />
      <InputText
        name="electrification.megawatts"
        :label="t('i.electrification.projectForm.megawattsLabel')"
        :disabled="!getEditable"
      />
      <Select
        name="electrification.bcEnvironmentAssessNeeded"
        :label="t('i.electrification.projectForm.bcEnvironmentAssessNeededLabel')"
        :disabled="!getEditable"
        :options="YES_NO_LIST"
      />
      <Select
        name="electrification.projectCategory"
        option-label="label"
        option-value="value"
        :label="t('i.electrification.projectForm.projectCategoryLabel')"
        :disabled="!getEditable"
        :options="options.ElectrificationProjectCategory"
      />
    </div>
  </Panel>
</template>
