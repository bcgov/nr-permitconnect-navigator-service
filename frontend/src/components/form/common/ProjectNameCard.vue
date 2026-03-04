<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { InputText } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0, showNumber = false } = defineProps<{
  tab?: number;
  showNumber?: boolean;
}>();

// Composables
const { t } = useI18n();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'ProjectNameCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <span
        class="section-header"
        role="heading"
        aria-level="2"
      >
        {{ t(showNumber ? 'projectNameCard.header.nameAndNumber' : 'projectNameCard.header.name') }}
      </span>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <InputText
          class="col-span-6"
          name="basic.projectName"
          :label="showNumber ? t('projectNameCard.labels.projectName') : t('projectNameCard.labels.projectNameLong')"
          :bold="false"
          :disabled="!getEditable"
        />

        <InputText
          v-if="showNumber"
          class="col-span-6"
          name="basic.projectNumber"
          :label="t('projectNameCard.labels.projectNumber')"
          :bold="false"
          :tooltip="t('projectNameCard.tooltips.projectNumber')"
          :disabled="!getEditable"
        />
        <div
          v-else
          class="col-span-6"
        />
      </div>
    </template>
  </Card>
</template>
