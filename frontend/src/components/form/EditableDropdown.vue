<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { Dropdown } from '@/lib/primevue';

import type { IInputEvent } from '@/interfaces';
import type { DropdownChangeEvent } from 'primevue/dropdown';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  options: Array<unknown>;
  getOptionLabel: Function;
  bold?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  bold: true
});

// Emits
const emit = defineEmits(['onInput', 'onChange']);

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field">
    <label
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <Dropdown
      v-model.trim="value"
      editable
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :options="props.options"
      :option-label="(option) => props.getOptionLabel(option)"
      @input="(e: IInputEvent) => emit('onInput', e)"
      @change="(e: DropdownChangeEvent) => emit('onChange', e)"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
