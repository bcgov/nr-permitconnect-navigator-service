<script setup lang="ts">
import { useField, useFormValues, useIsFormDirty } from 'vee-validate';
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
const { value: activityId } = useField('activityId');

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

watch(
  [() => values.value, activityId],
  ([newVals, newActId], [oldVals, oldActId]) => {
    if (!isDirty.value) {
      return;
    }

    // check to see if only activity id was changed, then skip autosave
    if (
      newActId !== oldActId &&
      JSON.stringify({ ...newVals, activityId: undefined }) === JSON.stringify({ ...oldVals, activityId: undefined })
    ) {
      return;
    }

    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
    }

    timeoutId.value = setTimeout(async () => {
      await callback();
      timeoutId.value = null;
    }, delay);
  },
  { deep: true }
);
</script>

<template><div /></template>
