<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';

import InputMaskInternal from './internal/InputMaskInternal.vue';
import { FloatLabel } from '@/lib/primevue';

// Props
const {
  helpText = '',
  label = '',
  name,
  mask,
  placeholder = '',
  disabled = false,
  bold = true,
  floatLabel = false
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  mask: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
  floatLabel?: boolean;
}>();
</script>

<template>
  <div class="field">
    <FloatLabel v-if="floatLabel">
      <InputMaskInternal v-bind="{ label, name, mask, placeholder, disabled, bold }" />
    </FloatLabel>
    <InputMaskInternal
      v-else
      v-bind="{ label, name, mask, placeholder, disabled, bold }"
    />

    <small :id="`${name}-help`">{{ helpText }}</small>
    <div class="mt-2">
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
