<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';

import InputTextInternal from './internal/InputTextInternal.vue';
import { FloatLabel } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
  floatLabel?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  floatLabel: false,
  bold: true
});
</script>

<template>
  <div class="field col">
    <FloatLabel
      v-if="props.floatLabel"
      class="mb-3"
    >
      <InputTextInternal v-bind="props" />
    </FloatLabel>
    <InputTextInternal
      v-else
      v-bind="props"
    />

    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
