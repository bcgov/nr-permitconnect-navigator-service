<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';

import InputMaskInternal from './internal/InputMaskInternal.vue';
import { FloatLabel } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  mask: string;
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
  bold: true,
  floatLabel: false
});
</script>

<template>
  <div class="field col">
    <FloatLabel v-if="props.floatLabel">
      <InputMaskInternal v-bind="props" />
    </FloatLabel>
    <InputMaskInternal
      v-else
      v-bind="props"
    />

    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
