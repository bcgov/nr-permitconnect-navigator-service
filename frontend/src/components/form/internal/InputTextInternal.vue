<script setup lang="ts">
import { useField } from 'vee-validate';

import Tooltip from '@/components/common/Tooltip.vue';
import { InputText } from '@/lib/primevue';

// Props
const {
  label = '',
  labelUrl = undefined,
  name,
  placeholder = '',
  disabled = false,
  bold = true,
  tooltip = undefined
} = defineProps<{
  label?: string;
  labelUrl?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
  tooltip?: string;
}>();

// Emits
const emit = defineEmits(['onChange', 'onClick', 'onInput']);

// State
const { errorMessage, handleBlur, value } = useField<string>(name);
</script>

<template>
  <label
    :id="`${name}-label`"
    :class="{ 'font-bold': bold }"
    :for="name"
  >
    <a
      v-if="labelUrl"
      :href="labelUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ label }}
    </a>
    <span v-else>
      {{ label }}
    </span>
  </label>
  <Tooltip
    v-if="tooltip"
    class="pl-2 mb-2"
    right
    icon="fa-solid fa-circle-question"
    :text="tooltip"
  />
  <InputText
    :id="name"
    v-model="value"
    :aria-describedby="`${name}-help`"
    :name="name"
    :placeholder="placeholder"
    class="w-full"
    :class="{ 'p-invalid': errorMessage }"
    :disabled="disabled"
    @change="(e: Event) => emit('onChange', e)"
    @click="(e: MouseEvent) => emit('onClick', e)"
    @blur="handleBlur"
    @input="(e: Event) => emit('onInput', e)"
  />
</template>
