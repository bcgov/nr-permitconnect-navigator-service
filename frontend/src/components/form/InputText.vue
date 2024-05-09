<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';
import { ref } from 'vue';

import InputTextInternal from './internal/InputTextInternal.vue';
import { FloatLabel } from '@/lib/primevue';

import type { Ref } from 'vue';

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

// State
const fieldActive: Ref<boolean> = ref(false);
</script>

<template>
  <div class="field">
    <FloatLabel
      v-if="props.floatLabel"
      class="mb-3"
    >
      <InputTextInternal v-bind="props" />
    </FloatLabel>
    <InputTextInternal
      v-else
      v-model:fieldActive="fieldActive"
      v-bind="props"
    />

    <small
      v-if="fieldActive"
      :id="`${name}-help`"
    >
      {{ helpText }}
    </small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
