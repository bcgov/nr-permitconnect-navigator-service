<script setup lang="ts">
import { useIsFormDirty } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRouter } from 'vue-router';

import { FormAutosave } from '@/components/form';
import { useConfirm } from '@/lib/primevue';

import type { Ref } from 'vue';
import type { CallbackFn } from '@/types';

// Props
const { autoSaveRef = null, callback = () => {} } = defineProps<{
  autoSaveRef?: InstanceType<typeof FormAutosave> | null;
  callback?: CallbackFn;
}>();

// Composables
const { t } = useI18n();

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
  if (isAccepted.value) return true;

  if (isDirty.value && !isOpen.value) {
    isOpen.value = true;
    confirm.require({
      message: t('formNavigationGuard.message'),
      header: t('formNavigationGuard.header'),
      acceptLabel: t('ui.actions.leave'),
      acceptClass: 'p-button-danger',
      rejectLabel: t('ui.actions.cancel'),
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
