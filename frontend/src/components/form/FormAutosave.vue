<script setup lang="ts">
import { useFormValues, useIsFormDirty } from 'vee-validate';
import { ref, watch } from 'vue';

import type { Ref } from 'vue';

// Props
const { callback, delay = 10000 } = defineProps<{
  callback: (...args: any[]) => any;
  delay?: number;
}>();

// State
const isDirty = useIsFormDirty();
const timeoutId: Ref<ReturnType<typeof setTimeout> | null> = ref(null);
const values = useFormValues();

// Actions
defineExpose({ stopAutoSave });

function stopAutoSave() {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }
}

watch(values.value, () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }

  if (isDirty.value) {
    timeoutId.value = setTimeout(async () => {
      await callback();
      timeoutId.value = null;
    }, delay);
  }
});
</script>

<template><div /></template>
