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
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false
});

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field col-12">
    <label :for="name">{{ label }}</label>
    <Textarea
      v-model.trim="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      :class="'w-full ' + { 'p-invalid': errorMessage }"
      :disabled="disabled"
      :rows="5"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <ErrorMessage :name="name" />
  </div>
</template>
