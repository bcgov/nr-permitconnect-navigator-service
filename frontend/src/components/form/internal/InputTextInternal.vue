<script setup lang="ts">
import { toRef } from 'vue';
import { useField } from 'vee-validate';

import { InputText } from '@/lib/primevue';

// Props
type Props = {
  helpText: string;
  label: string;
  name: string;
  placeholder: string;
  disabled: boolean;
  bold: boolean;
  floatLabel: boolean;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['onChange']);

// State
const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <label
    :class="{ 'font-bold': bold }"
    :for="name"
  >
    {{ label }}
  </label>
  <InputText
    v-model="value"
    :aria-describedby="`${name}-help`"
    :name="name"
    :placeholder="placeholder"
    class="w-full"
    :class="{ 'p-invalid': errorMessage }"
    :disabled="disabled"
    @change="(e) => emit('onChange', e)"
  />
</template>
