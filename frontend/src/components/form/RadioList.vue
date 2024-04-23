<script setup lang="ts">
import { ErrorMessage, useField } from 'vee-validate';
import { toRef } from 'vue';

import { RadioButton } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  options: Array<string> | undefined;
  bold?: boolean;
  floatLabel?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  placeholder: '',
  disabled: false,
  floatLabel: false,
  bold: true
});

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field col">
    <div class="flex flex-column gap-3">
      <div
        v-for="option in options"
        :key="option"
        class="flex flex-column align-items-start"
      >
        <div>
          <RadioButton
            v-model="value"
            :input-id="option"
            :name="name"
            :value="option"
            :class="{ 'p-invalid': errorMessage }"
            :disabled="disabled"
          />
          <label
            :for="option"
            class="ml-2 mb-0"
          >
            {{ option }}
          </label>
        </div>
      </div>
    </div>

    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
