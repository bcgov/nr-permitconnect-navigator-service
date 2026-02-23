<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { TextArea } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
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
useFormErrorWatcher(formRef, 'LocationDescriptionCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <div class="flex items-center">
        <div class="flex grow">
          <span
            class="section-header"
            role="heading"
            aria-level="2"
          >
            {{ t('locationDescriptionCard.header') }}
          </span>
        </div>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <TextArea
        class="col-span-12"
        name="location.projectLocationDescription"
        :disabled="!getEditable"
      />
    </template>
  </Card>
</template>
