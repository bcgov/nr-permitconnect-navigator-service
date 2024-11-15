<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import { DatePicker } from '@/lib/primevue';

// Props
const {
  helpText = '',
  label = '',
  name,
  disabled = false,
  showTime = false,
  bold = true,
  placeholder = '',
  maxDate = undefined
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  disabled?: boolean;
  showTime?: boolean;
  bold?: boolean;
  placeholder?: string;
  maxDate?: Date;
}>();

const { errorMessage, handleBlur, value } = useField<Date>(name);
</script>

<template>
  <div class="field">
    <label
      :id="`${name}-label`"
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <DatePicker
      v-model="value"
      :aria-describedby="`${name}-help`"
      :aria-labelledby="`${name}-label`"
      :name="name"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :show-time="showTime"
      hour-format="24"
      show-icon
      icon-display="input"
      date-format="yy/mm/dd"
      :placeholder="placeholder"
      :max-date="maxDate"
      @blur="handleBlur"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
