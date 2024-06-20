<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { AutoComplete } from '@/lib/primevue';

import type { IInputEvent } from '@/interfaces';
import type { AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from 'primevue/autocomplete';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  suggestions: Array<unknown>;
  getOptionLabel?: Function;
  bold?: boolean;
  forceSelection?: boolean;
  loading?: boolean;
  editable?: boolean;
  delay?: number;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  getOptionLabel: (e: string) => e,
  bold: true,
  forceSelection: false,
  loading: false,
  editable: false,
  delay: 300
});

// Emits
const emit = defineEmits(['onChange', 'onComplete', 'onInput']);
const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field">
    <label
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <AutoComplete
      v-model="value"
      :aria-describedby="`${name}-help`"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :delay="delay"
      :disabled="disabled"
      :editable="editable"
      :force-selection="forceSelection"
      input-class="w-full"
      :loading="false"
      :name="name"
      :option-label="(option: any) => props.getOptionLabel(option)"
      :placeholder="placeholder"
      :suggestions="props.suggestions"
      @input="(e: IInputEvent) => emit('onInput', e)"
      @change="(e: AutoCompleteChangeEvent) => emit('onChange', e)"
      @complete="(e: AutoCompleteCompleteEvent) => emit('onComplete', e)"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <div class="mt-2">
      <ErrorMessage
        :name="name"
        class="app-error-message"
      />
    </div>
  </div>
</template>
