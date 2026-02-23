<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Divider from '@/components/common/Divider.vue';
import { RadioList } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card } from '@/lib/primevue';
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
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'NaturalDisasterCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <div class="flex">
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('naturalDisasterCard.header') }}
        </span>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <RadioList
          class="col-span-12"
          name="location.naturalDisaster"
          :bold="false"
          :disabled="!getEditable"
          :options="YES_NO_LIST"
        />
      </div>
    </template>
  </Card>
</template>
