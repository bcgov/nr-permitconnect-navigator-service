<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onErrorCaptured } from 'vue';
import { RouterView } from 'vue-router';

import Breadcrumb from './components/common/Breadcrumb.vue';
import { AppLayout, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Message, Toast, useToast } from '@/lib/primevue';
import { useAppStore, useConfigStore } from '@/store';
import { ToastTimeout } from '@/utils/enums/application';

// Store
const appStore = useAppStore();
const { getIsLoading } = storeToRefs(appStore);
const { getConfig } = storeToRefs(useConfigStore());

// Top level error handler
onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.error('Error', e.message, { life: ToastTimeout.STICKY });
});
</script>

<template>
  <ConfirmDialog />
  <ProgressLoader v-if="getIsLoading" />
  <Toast />

  <AppLayout>
    <template #main>
      <Message
        v-if="getConfig?.notificationBanner"
        severity="warn"
        class="text-center"
      >
        {{ getConfig?.notificationBanner }}
      </Message>
      <Breadcrumb />
      <RouterView />
    </template>
  </AppLayout>
</template>
