<script setup lang="ts">
import { useFormValues, useIsFormDirty } from 'vee-validate';
import { onBeforeUnmount, ref, watch } from 'vue';

import type { Ref } from 'vue';

// Constants
const DEFAULT_DELAY = 10000;

// Props
const { callback, delay = DEFAULT_DELAY } = defineProps<{
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

onBeforeUnmount(() => {
  stopAutoSave();
});

watch(values.value, (o, n) => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }

  if (isDirty.value) {
    console.log(o);
    console.log(n);
    timeoutId.value = setTimeout(async () => {
      await callback();
      timeoutId.value = null;
    }, delay);
  }
});
</script>

<template><div /></template>
