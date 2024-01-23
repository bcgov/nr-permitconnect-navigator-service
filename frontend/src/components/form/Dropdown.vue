<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { Dropdown } from '@/lib/primevue';

import type { DropdownChangeEvent } from 'primevue/dropdown';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  options: Array<any> | undefined;
  optionLabel?: string;
  bold?: boolean;
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  optionLabel: undefined,
  bold: true,
  loading: undefined
});

// Emits
const emit = defineEmits(['onChange']);

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field col">
    <label
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <Dropdown
      v-model.trim="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :options="props.options"
      :option-label="props.optionLabel"
      :loading="props.loading"
      @change="(e: DropdownChangeEvent) => emit('onChange', e)"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
