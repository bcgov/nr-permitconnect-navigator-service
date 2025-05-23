<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';
import { onBeforeMount } from 'vue';

import { AutoComplete } from '@/lib/primevue';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';

// Props

const {
  helpText = '',
  label = '',
  name,
  placeholder = '',
  disabled = false,
  suggestions,
  getOptionLabel = (e: string) => e,
  bold = true,
  forceSelection = false,
  loading = false,
  editable = false,
  delay = 300
} = defineProps<{
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  suggestions: Array<unknown>;
  getOptionLabel?: Function;
  bold?: boolean;
  forceSelection?: boolean;
  loading?: boolean;
  editable?: boolean;
  delay?: number;
}>();

// Emits
const emit = defineEmits(['onComplete']);
const { errorMessage, handleBlur, value, resetField } = useField<string>(name);

onBeforeMount(() => {
  resetField({ touched: false });
});
</script>

<template>
  <div>
    <label
      :id="`${name}-label`"
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <AutoComplete
      v-model="value"
      append-to="body"
      :aria-describedby="`${name}-help`"
      :aria-labelledby="`${name}-label`"
      class="w-full"
      :invalid="!!errorMessage"
      :delay="delay"
      :disabled="disabled"
      :editable="editable"
      :force-selection="forceSelection"
      input-class="w-full"
      :loading="loading"
      :name="name"
      :option-label="(option: any) => getOptionLabel(option)"
      :placeholder="placeholder"
      :suggestions="suggestions"
      @blur="handleBlur"
      @complete="(e: AutoCompleteCompleteEvent) => emit('onComplete', e)"
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

<style scoped lang="scss">
:deep(.p-invalid) {
  .p-autocomplete-input {
    border-color: var(--p-red-500);
  }
}
</style>
