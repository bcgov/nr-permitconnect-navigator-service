<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';

import DropdownInternal from './internal/DropdownInternal.vue';
import { FloatLabel } from '@/lib/primevue';

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
</script>

<template>
  <div class="field">
    <FloatLabel v-if="props.floatLabel">
      <DropdownInternal
        v-bind="props"
        @on-change="(e: DropdownChangeEvent) => emit('onChange', e)"
      />
    </FloatLabel>
    <DropdownInternal
      v-else
      v-bind="props"
      @on-change="(e: DropdownChangeEvent) => emit('onChange', e)"
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
