<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { Checkbox } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card } from '@/lib/primevue';
import { useFormStore } from '@/store';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'FeedbackConsentCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #content>
      <div class="mb-2 flex items-center">
        <Checkbox
          class="m-0 inline-block"
          name="basic.consentToFeedback"
          :bold="false"
          :disabled="!getEditable"
        />
        <span class="font-bold inline">
          Check this box if you agree to be contacted for user feedback, helping us improve our digital service. Your
          personal information will not be shared with third parties.
        </span>
      </div>
    </template>
  </Card>
</template>
