<script setup lang="ts">
import { ErrorMessage, useField } from 'vee-validate';
import { onBeforeMount, watch } from 'vue';

import { RadioButton } from '@/lib/primevue';

// Interfaces
interface RadioOptionObject {
  label: string | number;
  value: string | number;
}

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
  options: (RadioOptionObject | string)[] | undefined;
}>();

// Emits
const emit = defineEmits(['onChange', 'onClick']);

// State
const { errorMessage, handleBlur, value, resetField } = useField<string>(name);

// Actions
function isRadioListOptionObject(option: RadioOptionObject | string): option is RadioOptionObject {
  return typeof option === 'object' && option !== null && 'label' in option && 'value' in option;
}

function getRadioListOptionLabel(option: RadioOptionObject | string): string {
  return isRadioListOptionObject(option) ? option.label.toString() : option;
}

function getRadioListOptionValue(option: RadioOptionObject | string): string {
  return isRadioListOptionObject(option) ? option.value.toString() : option;
}

watch(value, () => {
  emit('onChange', value.value);
});

onBeforeMount(() => {
  resetField({ touched: false });
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-4">
      <div
        v-for="option in options"
        :key="getRadioListOptionValue(option)"
        class="flex flex-col items-start"
      >
        <div>
          <RadioButton
            v-model="value"
            :aria-describedby="`${name}-help`"
            :aria-labelledby="`${name}-option-${option}`"
            :input-id="getRadioListOptionValue(option)"
            :name="name"
            :value="getRadioListOptionValue(option)"
            :class="{ 'p-invalid': errorMessage }"
            :disabled="disabled"
            @blur="handleBlur"
            @click="emit('onClick', value)"
          />
          <span
            :id="`${name}-option-${getRadioListOptionValue(option)}`"
            :for="getRadioListOptionValue(option)"
            class="ml-2 mb-0"
          >
            {{ getRadioListOptionLabel(option) }}
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
