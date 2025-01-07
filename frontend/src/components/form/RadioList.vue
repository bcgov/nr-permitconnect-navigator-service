<script setup lang="ts">
import { ErrorMessage, useField } from 'vee-validate';
import { onMounted, watch } from 'vue';

import { RadioButton } from '@/lib/primevue';

// Props
const {
  helpText = '',
  name,
  disabled = false,
  options
} = defineProps<{
  helpText?: string;
  name: string;
  disabled?: boolean;
  options: Array<string> | undefined;
}>();

// Emits
const emit = defineEmits(['onChange', 'onClick']);

// State
const { errorMessage, value, resetField } = useField<string>(name);

// Actions
watch(value, () => {
  emit('onChange', value.value);
});

onMounted(() => {
  resetField({ touched: false });
});
</script>

<template>
  <div class="field">
    <div class="flex flex-col gap-4">
      <div
        v-for="option in options"
        :key="option"
        class="flex flex-col items-start"
      >
        <div>
          <RadioButton
            v-model="value"
            :aria-describedby="`${name}-help`"
            :aria-labelledby="`${name}-option-${option}`"
            :input-id="option"
            :name="name"
            :value="option"
            :class="{ 'p-invalid': errorMessage }"
            :disabled="disabled"
            @blur="handleBlur"
            @click="emit('onClick', value)"
          />
          <span
            :id="`${name}-option-${option}`"
            :for="option"
            class="ml-2 mb-0"
          >
            {{ option }}
          </span>
        </div>
      </div>
    </div>

    <small :id="`${name}-help`">{{ helpText }}</small>
    <div class="mt-2">
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
