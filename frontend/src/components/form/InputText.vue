<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';

import InputTextInternal from './internal/InputTextInternal.vue';
import { FloatLabel } from '@/lib/primevue';

// Props
const {
  helpText = '',
  label = '',
  name,
  placeholder = '',
  disabled = false,
  floatLabel = false,
  bold = true
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
  floatLabel?: boolean;
}>();

// Emits
const emit = defineEmits(['onChange']);
</script>

<template>
  <div class="field">
    <FloatLabel v-if="floatLabel">
      <InputTextInternal
        v-bind="{ label, name, placeholder, disabled, bold }"
        @on-change="(e) => emit('onChange', e)"
      />
    </FloatLabel>
    <InputTextInternal
      v-else
      v-bind="{ label, name, placeholder, disabled, bold }"
      @on-change="(e) => emit('onChange', e)"
    />

    <small :id="`${name}-help`">
      {{ helpText }}
    </small>
    <div class="mt-2">
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
