<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { Calendar } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  disabled?: boolean;
  showTime?: boolean;
  bold?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  disabled: false,
  showTime: false,
  bold: true
});

const { errorMessage, value } = useField<Date>(toRef(props, 'name'));
</script>

<template>
  <div class="field col">
    <label
      :class="{ 'font-bold': bold }"
      :for="name"
    >
      {{ label }}
    </label>
    <Calendar
      v-model="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      class="w-full"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
      :show-time="props.showTime"
      hour-format="24"
      show-icon
      icon-display="input"
      date-format="yy/mm/dd"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage :name="name" />
    </div>
  </div>
</template>
