<script setup lang="ts">
import { useConfirm } from '@/lib/primevue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useIsFormDirty } from 'vee-validate';
import { ref } from 'vue';

import { FormAutosave } from '@/components/form';

import type { Ref } from 'vue';

// Props
const { autoSaveRef = null, callback = () => {} } = defineProps<{
  autoSaveRef?: InstanceType<typeof FormAutosave> | null;
  callback?: (...args: any[]) => any;
}>();

// State
const isAccepted: Ref<boolean> = ref(false);
const isDirty = useIsFormDirty();
const isOpen: Ref<boolean> = ref(false);

// Actions
const confirm = useConfirm();
const router = useRouter();

onBeforeRouteLeave(async (to) => {
  autoSaveRef?.stopAutoSave();

  // Skip navigation guard if already accepted
  if (isAccepted.value) {
    return true;
  }

  if (isDirty.value && !isOpen.value) {
    isOpen.value = true;
    confirm.require({
      message: 'Are you sure you want to leave this page? Any unsaved changes will be lost.',
      header: 'Leave this page?',
      acceptLabel: 'Leave',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectProps: { outlined: true },
      accept: async () => {
        isAccepted.value = true;
        await callback();
        router.replace(to);
      },
      reject: () => (isOpen.value = false)
    });

    return false;
  } else {
    await callback();
  }

  return true;
});
</script>

<template><div /></template>
