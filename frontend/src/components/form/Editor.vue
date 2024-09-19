<script setup lang="ts">
import { ErrorMessage, useField } from 'vee-validate';

import { Editor } from '@/lib/primevue';

// Props
const {
  helpText = '',
  name,
  height = '160px'
} = defineProps<{
  helpText?: string;
  name: string;
  height?: string;
}>();

const { errorMessage, value } = useField<string>(name);
</script>

<template>
  <div class="field">
    <Editor
      v-model="value"
      :editor-style="`height: ${height}`"
    />

    <small :id="`${name}-help`">{{ helpText }}</small>
    <div>
      <ErrorMessage
        :aria-describedby="`${name}-help`"
        :name="name"
        class="w-full"
        :class="{ 'p-invalid': errorMessage }"
      />
    </div>
  </div>
</template>
