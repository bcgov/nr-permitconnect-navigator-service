<script setup lang="ts">
import { ProgressSpinner } from '@/lib/primevue';
</script>

<template>
  <div class="flex justify-center">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      stroke-width="4"
      aria-label="Loading"
    />
  </div>
</template>
