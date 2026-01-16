<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';

import SelectInternal from './internal/SelectInternal.vue';
import { FloatLabel } from '@/lib/primevue';

import type { SelectChangeEvent } from 'primevue/select';

// Props
const {
  helpText = '',
  label = '',
  name,
  placeholder = '',
  disabled = false,
  options,
  optionLabel = undefined,
  optionValue = undefined,
  bold = true,
  loading = undefined,
  floatLabel = false
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[]; // Matches Prisma type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionLabel?: string | ((data: any) => string) | undefined; // Matches Prisma type
  optionValue?: string;
  bold?: boolean;
  loading?: boolean;
  floatLabel?: boolean;
}>();

// Emits
const emit = defineEmits(['onChange']);
</script>

<template>
  <div>
    <FloatLabel v-if="floatLabel">
      <SelectInternal
        v-bind="{ label, name, placeholder, disabled, options, optionLabel, optionValue, bold, loading, floatLabel }"
        @on-change="(e: SelectChangeEvent) => emit('onChange', e)"
      />
    </FloatLabel>
    <SelectInternal
      v-else
      v-bind="{ label, name, placeholder, disabled, optionLabel, options, optionValue, bold, loading, floatLabel }"
      @on-change="(e: SelectChangeEvent) => emit('onChange', e)"
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
