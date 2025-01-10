<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import { Textarea } from '@/lib/primevue';

// Props
const {
  helpText = '',
  label = '',
  name,
  placeholder = '',
  disabled = false,
  bold = true,
  rows = 5
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
  rows?: number;
}>();

const { errorMessage, handleBlur, value } = useField<string>(name);
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
    <Textarea
      v-model="value"
      :aria-describedby="`${name}-help`"
      :aria-labelledby="`${name}-label`"
      :name="name"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :rows="rows"
      maxlength="4000"
      @blur="handleBlur"
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
