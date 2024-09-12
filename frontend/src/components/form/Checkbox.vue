<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import { Checkbox } from '@/lib/primevue';

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

const { errorMessage, value } = useField<string>(name);
</script>

<template>
  <div class="field">
    <div class="flex align-items-center">
      <Checkbox
        v-model="value"
        binary
        :aria-describedby="`${name}-help`"
        :aria-labelledby="`${name}-label`"
        :name="name"
        :class="{ 'p-invalid': errorMessage || invalid }"
        :disabled="disabled"
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
  </div>
</template>
