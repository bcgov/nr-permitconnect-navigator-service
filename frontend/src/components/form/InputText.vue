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
const emit = defineEmits(['onChange', 'onClick', 'onInput']);
</script>

<template>
  <div>
    <FloatLabel v-if="floatLabel">
      <InputTextInternal
        v-bind="{ label, name, placeholder, disabled, bold }"
        @on-change="(e: Event) => emit('onChange', e)"
        @on-click="(e: Event) => emit('onClick', e)"
        @on-input="(e: Event) => emit('onInput', e)"
      />
    </FloatLabel>
    <InputTextInternal
      v-else
      v-bind="{ label, name, placeholder, disabled, bold }"
      @on-change="(e: Event) => emit('onChange', e)"
      @on-click="(e: Event) => emit('onClick', e)"
      @on-input="(e: Event) => emit('onInput', e)"
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
