<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import { Dropdown } from '@/lib/primevue';

import type { IInputEvent } from '@/interfaces';
import type { DropdownChangeEvent } from 'primevue/dropdown';

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

const { errorMessage, value } = useField<string>(name);
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
    <Dropdown
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
      :option-label="(option) => getOptionLabel(option)"
      @input="(e: IInputEvent) => emit('onInput', e)"
      @change="(e: DropdownChangeEvent) => emit('onChange', e)"
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
