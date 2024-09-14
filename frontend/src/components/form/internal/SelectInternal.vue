<script setup lang="ts">
import { useField } from 'vee-validate';

import { Select } from '@/lib/primevue';

import type { SelectChangeEvent } from 'primevue/select';

// Props
const {
  label = '',
  name,
  placeholder = '',
  disabled = false,
  options,
  optionLabel = undefined,
  optionValue = undefined,
  bold = true,
  loading = undefined,
  floatLabel = false
} = defineProps<{
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  options: Array<any> | undefined;
  optionLabel?: string | ((data: any) => string);
  optionValue?: string;
  bold?: boolean;
  loading?: boolean;
  floatLabel?: boolean;
}>();

// Emits
const emit = defineEmits(['onChange']);

const { errorMessage, value } = useField<string>(name);
</script>

<template>
  <!-- Label needs to be set differently depending if it's floating or not -->
  <label
    v-if="!floatLabel"
    :id="`${name}-label`"
    :class="{ 'font-bold': bold }"
    :for="name"
  >
    {{ label }}
  </label>
  <Select
    v-model="value"
    :aria-describedby="`${name}-help`"
    :aria-labelledby="`${name}-label`"
    :name="name"
    :placeholder="placeholder"
    class="w-full"
    :class="{ 'p-invalid': errorMessage }"
    :disabled="disabled"
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :loading="loading"
    @change="(e: SelectChangeEvent) => emit('onChange', e)"
  />
  <label
    v-if="floatLabel"
    :id="`${name}-label`"
    :class="{ 'font-bold': bold }"
    :for="name"
  >
    {{ label }}
  </label>
</template>
