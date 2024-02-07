<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { Button } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';
import { useAuthStore } from '@/store';

// Store
const { getIsAuthenticated } = storeToRefs(useAuthStore());

const router = useRouter();

const toSubmissions = (): void => {
  router.push({ name: RouteNames.SUBMISSIONS });
};
</script>

<template>
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
