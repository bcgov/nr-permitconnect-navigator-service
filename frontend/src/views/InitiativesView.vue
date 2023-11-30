<script setup lang="ts">
import { Button } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';
</script>

<template>
  <router-link :to="{ name: RouteNames.SUBMISSIONS }">
    <Button>Housing</Button>
  </router-link>
</template>
