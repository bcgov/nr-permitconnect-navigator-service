<script setup lang="ts">
import { useField, ErrorMessage } from 'vee-validate';

import { Password } from '@/lib/primevue';

// Props
const {
  helptext = '',
  type = 'text',
  label = '',
  name,
  placeholder = '',
  bold = true
} = defineProps<{
  helptext?: string;
  label?: string;
  name: string;
  placeholder?: string;
  type?: string;
  bold?: boolean;
}>();

const { errorMessage, value } = useField<string>(name);
</script>

<template>
  <div class="field">
    <label
      :id="`${name}-label`"
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <Password
      v-model="value"
      :aria-describedby="`${name}-help`"
      :aria-labelledby="`${name}-label`"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :feedback="false"
      toggle-mask
    />
    <small :id="`${name}-help`">{{ helptext }}</small>
    <div>
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
