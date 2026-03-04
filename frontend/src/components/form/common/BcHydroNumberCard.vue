<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { InputText } from '@/components/form';
import { Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'BcHydroNumberCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <h6
        class="section-header"
        aria-level="2"
      >
        {{ t('bcHydroNumberCard.header') }}
      </h6>
      <Divider type="solid" />
    </template>
    <template #content>
      <InputText
        name="project.bcHydroNumber"
        :bold="false"
        :disabled="!getEditable"
      />
    </template>
  </Card>
</template>
