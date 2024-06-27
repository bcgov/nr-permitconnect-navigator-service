<script setup lang="ts">
import { toRef, ref } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { InputNumber } from '@/lib/primevue';

import type { Ref } from 'vue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  bold?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  bold: true
});

// State
const { errorMessage, value } = useField<number>(toRef(props, 'name'));
const fieldActive: Ref<boolean> = ref(false);

// Emits
const emit = defineEmits(['onBlur', 'onFocus']);
</script>

<template>
  <div class="field">
    <label
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <InputNumber
      v-model="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :min-fraction-digits="0"
      :max-fraction-digits="6"
      @blur="
        () => {
          fieldActive = true;
          emit('onBlur');
        }
      "
      @focus="
        () => {
          fieldActive = true;
          emit('onFocus');
        }
      "
    />
    <small
      v-if="fieldActive"
      :id="`${name}-help`"
    >
      {{ helpText }}
    </small>
    <div class="mt-2">
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
