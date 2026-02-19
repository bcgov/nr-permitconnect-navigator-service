<script setup lang="ts">
import { useField, ErrorMessage, useSetFieldValue } from 'vee-validate';

import { Checkbox } from '@/lib/primevue';
import { watchEffect } from 'vue';

// Props
const {
  helpText = '',
  label = '',
  name,
  disabled = false,
  bold = true,
  invalid = false
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  disabled?: boolean;
  bold?: boolean;
  invalid?: boolean;
}>();

// Composables
const { errorMessage, handleBlur, value } = useField<string>(name);
const setFieldValue = useSetFieldValue(name);

// Actions
// Default to false if value is null or undefined
watchEffect(() => {
  if (value.value === null || value.value === undefined) setFieldValue(false);
});
</script>

<template>
  <div class="flex items-center">
    <Checkbox
      v-model="value"
      binary
      :aria-describedby="`${name}-help`"
      :aria-labelledby="`${name}-label`"
      :name="name"
      :class="{ 'p-invalid': errorMessage || invalid }"
      :disabled="disabled"
      @blur="handleBlur"
    />
    <label
      :id="`${name}-label`"
      class="pl-2 mb-0"
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
