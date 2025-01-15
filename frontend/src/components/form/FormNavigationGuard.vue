<script setup lang="ts">
import { useConfirm } from '@/lib/primevue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useIsFormDirty } from 'vee-validate';
import { ref } from 'vue';

import type { Ref } from 'vue';

// State
const isDirty = useIsFormDirty();
const isOpen: Ref<boolean> = ref(false);

// Actions
const confirm = useConfirm();
const router = useRouter();

onBeforeRouteLeave((to) => {
  if (isDirty.value && !isOpen.value) {
    isOpen.value = true;
    confirm.require({
      message: 'Are you sure you want to leave this page? Any unsaved changes will be lost.',
      header: 'Leave this page?',
      acceptLabel: 'Leave',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectProps: { outlined: true },
      accept: () => router.replace(to),
      reject: () => (isOpen.value = false)
    });

    return false;
  }

  return true;
});
</script>

<template><div /></template>
