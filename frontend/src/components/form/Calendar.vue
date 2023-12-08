<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { Calendar } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  disabled: false
});

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field col">
    <label :for="name">{{ label }}</label>
    <Calendar
      v-model.trim="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :class="'w-full ' + { 'p-invalid': errorMessage }"
      :disabled="disabled"
      show-time
      hour-format="24"
      show-icon
      icon-display="input"
      date-format="yy/mm/dd"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <ErrorMessage :name="name" />
  </div>
</template>
