<script setup lang="ts">
import { toRef } from 'vue';
import { ErrorMessage, useField } from 'vee-validate';

import { Editor } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  name: string;
  height?: string;
};

const props = withDefaults(defineProps<Props>(), { helpText: '', height: '160px' });

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field col">
    <Editor
      v-model="value"
      :editor-style="`height: ${props.height}`"
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
