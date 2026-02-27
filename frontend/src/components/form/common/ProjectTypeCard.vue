<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSetFieldValue } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { RadioList } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Divider } from '@/lib/primevue';
import { useAppStore, useCodeStore, useFormStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();
const setBcHydroNumber = useSetFieldValue('project.bcHydroNumber');

// Store
const formStore = useFormStore();
const { getInitiative } = storeToRefs(useAppStore());
const { enums, options } = useCodeStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);
const listOptions = computed(() => {
  if (getInitiative.value === Initiative.ELECTRIFICATION) return options.ElectrificationProjectType;
  return [];
});

// Actions
useFormErrorWatcher(formRef, 'ProjectTypeCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <span
        class="section-header"
        role="heading"
        aria-level="2"
      >
        {{ t('projectTypeCard.header') }}
      </span>
      <Divider type="solid" />
    </template>
    <template #content>
      <RadioList
        name="project.projectType"
        :disabled="!getEditable"
        :options="listOptions"
        @on-change="
          (e: string) => {
            if (e === enums.ElectrificationProjectType.OTHER) setBcHydroNumber(null);
          }
        "
      />
    </template>
  </Card>
</template>
