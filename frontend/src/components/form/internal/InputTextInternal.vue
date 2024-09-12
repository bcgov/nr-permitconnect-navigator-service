<script setup lang="ts">
import { useField } from 'vee-validate';

import { InputText } from '@/lib/primevue';

// Props
const {
  label = '',
  name,
  placeholder = '',
  disabled = false,
  bold = true
} = defineProps<{
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
}>();

// Emits
const emit = defineEmits(['onChange']);

// State
const { errorMessage, value } = useField<string>(name);
</script>

<template>
  <label
    :id="`${name}-label`"
    :class="{ 'font-bold': bold }"
    :for="name"
  >
    {{ label }}
  </label>
  <InputText
    v-model="value"
    :aria-describedby="`${name}-help`"
    :aria-labelledby="`${name}-label`"
    :name="name"
    :placeholder="placeholder"
    class="w-full"
    :class="{ 'p-invalid': errorMessage }"
    :disabled="disabled"
    @change="(e) => emit('onChange', e)"
  />
</template>
