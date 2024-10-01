<script setup lang="ts">
import { useField } from 'vee-validate';

import { InputMask } from '@/lib/primevue';

// Props
const { label, name, mask, placeholder, disabled, bold } = defineProps<{
  label: string;
  name: string;
  mask: string;
  placeholder: string;
  disabled: boolean;
  bold: boolean;
}>();

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
  <InputMask
    v-model="value"
    :aria-describedby="`${name}-help`"
    :aria-labelledby="`${name}-label`"
    :name="name"
    :mask="mask"
    :placeholder="placeholder"
    class="w-full"
    :class="{ 'p-invalid': errorMessage }"
    :disabled="disabled"
  />
</template>
