<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { Button, Message } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';
import { useAuthStore, useConfigStore } from '@/store';

// Store
const { getConfig } = storeToRefs(useConfigStore());
const { getIsAuthenticated } = storeToRefs(useAuthStore());

const router = useRouter();

const toSubmissions = (): void => {
  router.push({ name: RouteNames.SUBMISSIONS });
};
</script>

<template>
  <Message
    v-if="getConfig?.notificationBanner"
    severity="warn"
  >
    {{ getConfig?.notificationBanner }}
  </Message>

  <div class="text-center">
    <h1 class="font-bold">Welcome to the PermitConnect Applications</h1>
    <h2 class="mb-3">Choose an Initiative:</h2>
    <Button
      :disabled="!getIsAuthenticated"
      @click="toSubmissions"
    >
      Housing
    </Button>
  </div>
</template>
