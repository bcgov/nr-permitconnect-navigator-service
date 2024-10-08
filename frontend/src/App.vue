<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';

import { AppLayout, Navbar, ProgressLoader } from '@/components/layout';
import { ConfirmDialog, Message, Toast, useToast } from '@/lib/primevue';
import { useAppStore, useAuthNStore, useConfigStore } from '@/store';
import { RouteName, ToastTimeout } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Store
const appStore = useAppStore();
const router = useRouter();
const { getIsLoading } = storeToRefs(appStore);
const { getConfig } = storeToRefs(useConfigStore());

// State
const ready: Ref<boolean> = ref(false);

// Actions
onBeforeMount(async () => {
  appStore.beginDeterminateLoading();
  await useConfigStore().init();
  await useAuthNStore().init();
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
  <ConfirmDialog />
  <ProgressLoader v-if="getIsLoading" />
  <Toast />

  <AppLayout>
    <template #nav>
      <Navbar
        v-if="
          router.currentRoute.value.name &&
          router.currentRoute.value.name !== RouteName.HOME &&
          ![RouteName.OIDC_LOGIN, RouteName.OIDC_CALLBACK, RouteName.OIDC_LOGOUT].includes(
            router.currentRoute.value.name as any
          )
        "
      />
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
</template>
