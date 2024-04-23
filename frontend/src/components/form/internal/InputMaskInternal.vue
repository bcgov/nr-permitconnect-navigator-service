<script setup lang="ts">
import { toRef } from 'vue';
import { useField } from 'vee-validate';

import { InputMask } from '@/lib/primevue';

// Props
type Props = {
  helpText: string;
  label: string;
  name: string;
  mask: string;
  placeholder: string;
  disabled: boolean;
  bold: boolean;
  floatLabel: boolean;
};

const props = withDefaults(defineProps<Props>(), {});

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <label
    :class="{ 'font-bold': bold }"
    :for="name"
  >
    {{ label }}
  </label>
  <InputMask
    v-model.trim="value"
    :aria-describedby="`${name}-help`"
    :name="name"
    :mask="mask"
    :placeholder="placeholder"
    class="w-full"
    :class="{ 'p-invalid': errorMessage }"
    :disabled="disabled"
  />
</template>
