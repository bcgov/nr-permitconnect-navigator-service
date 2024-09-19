<script setup lang="ts">
import { Divider } from '@/lib/primevue';

// Props
const { title } = defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="col-12 mb-3 flex">
    <h4 class="flex-none flex align-items-center m-0">{{ title }}</h4>
    <Divider class="flex-grow-1 flex ml-4" />
  </div>
</template>
