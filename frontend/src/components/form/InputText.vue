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

// Emits
const emit = defineEmits(['onChange']);

// State
const fieldActive: Ref<boolean> = ref(false);
</script>

<template>
  <div class="field">
    <FloatLabel v-if="props.floatLabel">
      <InputTextInternal
        v-bind="props"
        @on-change="(e) => emit('onChange', e)"
      />
    </FloatLabel>
    <InputTextInternal
      v-else
      v-model:fieldActive="fieldActive"
      v-bind="props"
      @on-change="(e) => emit('onChange', e)"
    />

    <small
      v-if="fieldActive"
      :id="`${name}-help`"
    >
      {{ helpText }}
    </small>
    <div class="mt-2">
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
