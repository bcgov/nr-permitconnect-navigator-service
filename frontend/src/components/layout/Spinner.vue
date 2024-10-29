<script setup lang="ts">
import { ProgressSpinner } from '@/lib/primevue';
</script>

<template>
  <ProgressSpinner
    class="flex justify-content-center"
    style="width: 50px; height: 50px"
    stroke-width="4"
    aria-label="Loading"
  />
</template>
