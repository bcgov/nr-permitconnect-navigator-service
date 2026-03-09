<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import Tooltip from '@/components/common/Tooltip.vue';
import { Textarea } from '@/lib/primevue';

// Props
const {
  helpText = '',
  label = '',
  name,
  placeholder = '',
  disabled = false,
  bold = true,
  rows = 5,
  tooltip = undefined
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
  rows?: number;
  tooltip?: string;
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
    <Tooltip
      v-if="tooltip"
      class="pl-2 mb-2"
      right
      icon="fa-solid fa-circle-question"
      :text="tooltip"
    />
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
    <div class="mt-1">
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
