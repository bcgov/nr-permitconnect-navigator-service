<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import { Select } from '@/lib/primevue';

import type { IInputEvent } from '@/interfaces';
import type { SelectChangeEvent } from 'primevue/select';

// Props
const {
  helpText = '',
  label = '',
  name,
  placeholder = '',
  disabled = false,
  options,
  getOptionLabel = (e: string) => e,
  bold = true
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  options: Array<unknown>;
  getOptionLabel: Function;
  bold?: boolean;
}>();

// Emits
const emit = defineEmits(['onInput', 'onChange']);

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
    <Select
      v-model="value"
      editable
      :aria-describedby="`${name}-help`"
      :aria-labelledby="`${name}-label`"
      :name="name"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :options="options"
      :option-label="(option: Array<unknown>) => getOptionLabel(option)"
      @blur="handleBlur"
      @input="(e: IInputEvent) => emit('onInput', e)"
      @change="(e: SelectChangeEvent) => emit('onChange', e)"
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

<style scoped lang="scss">
:deep(.p-select-label::placeholder) {
  font-size: 1rem;
}

:deep(input) {
  font-size: 1rem;
  padding: 0.6rem;
}
</style>
