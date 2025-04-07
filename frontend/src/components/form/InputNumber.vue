<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import { InputNumber } from '@/lib/primevue';
import type { InputNumberBlurEvent } from 'primevue/inputnumber';

// Props
const {
  helpText = '',
  label = '',
  name,
  placeholder = '',
  disabled = false,
  bold = true
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
}>();

// State
const { errorMessage, handleBlur, value } = useField<number>(name);
</script>

<template>
  <div>
    <label
      :id="`${name}-label`"
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <InputNumber
      v-model="value"
      :aria-describedby="`${name}-help`"
      :aria-labelledby="`${name}-label`"
      :name="name"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :min-fraction-digits="0"
      :max-fraction-digits="6"
      @blur="(e: InputNumberBlurEvent) => handleBlur(e.originalEvent)"
    />
    <small
      v-if="helpText"
      :id="`${name}-help`"
    >
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
