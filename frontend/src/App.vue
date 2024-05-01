<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { RouterView } from 'vue-router';

import { AppLayout, Navbar, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Message, Toast, useToast } from '@/lib/primevue';
import { useAppStore, useAuthStore, useConfigStore } from '@/store';
import { ToastTimeout } from '@/utils/constants';

import type { Ref } from 'vue';

// Store
const appStore = useAppStore();
const { getIsLoading } = storeToRefs(appStore);
const { getConfig } = storeToRefs(useConfigStore());

// State
const ready: Ref<boolean> = ref(false);

// Actions
onBeforeMount(async () => {
  appStore.beginDeterminateLoading();
  await useConfigStore().init();
  await useAuthStore().init();
  appStore.endDeterminateLoading();
  ready.value = true;
});

// Top level error handler
onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.error('Error', e.message, { life: ToastTimeout.STICKY });
});
</script>

<template>
  <div class="container">
    <ConfirmDialog />
    <ProgressLoader v-if="getIsLoading" />
    <Toast />

    <AppLayout>
      <template #nav>
        <Navbar />
      </template>
      <template #main>
        <Message
          v-if="getConfig?.notificationBanner"
          severity="warn"
          class="text-center"
        >
          {{ getConfig?.notificationBanner }}
        </Message>
        <RouterView v-if="ready" />
      </template>
    </AppLayout>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}
</style>
