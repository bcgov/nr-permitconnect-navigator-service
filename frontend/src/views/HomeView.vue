<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';

// Store
const router = useRouter();
const toStart = (): void => {
  router.push({ name: RouteNames.START });
};
</script>

<template>
  <div class="text-center">
    <h1 class="font-bold">Welcome to the PermitConnect Applications</h1>
    <h2 class="mb-3">Choose an Initiative:</h2>
    <Button @click="toStart">Housing</Button>
  </div>
</template>
