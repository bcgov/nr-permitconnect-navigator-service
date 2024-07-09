<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { Textarea } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
  rows?: number;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  bold: true,
  rows: 5
});

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
    <Textarea
      v-model="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :rows="rows"
      maxlength="4000"
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
