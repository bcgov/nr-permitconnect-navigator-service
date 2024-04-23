<script setup lang="ts">
import { toRef } from 'vue';
import { useField } from 'vee-validate';

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
  optionLabel?: string | ((data: any) => string);
  optionValue?: string;
  bold?: boolean;
  loading?: boolean;
  floatLabel?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  optionLabel: undefined,
  optionValue: undefined,
  bold: true,
  loading: undefined,
  floatLabel: false
});

// Emits
const emit = defineEmits(['onChange']);

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <!-- Label needs to be set differently depending if it's floating or not -->
  <label
    v-if="!props.floatLabel"
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
    :option-value="props.optionValue"
    :loading="props.loading"
    @change="(e: DropdownChangeEvent) => emit('onChange', e)"
  />
  <label
    v-if="props.floatLabel"
    :class="{ 'font-bold': bold }"
    :for="name"
  >
    {{ label }}
  </label>
</template>
