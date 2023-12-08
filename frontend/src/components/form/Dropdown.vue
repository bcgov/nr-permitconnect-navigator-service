<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { Dropdown } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  options: Array<string>;
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
  <div class="field col">
    <label :for="name">{{ label }}</label>
    <Dropdown
      v-model.trim="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      :class="'w-full ' + { 'p-invalid': errorMessage }"
      :disabled="disabled"
      :options="props.options"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <ErrorMessage :name="name" />
  </div>
</template>
