<script setup lang="ts">
import { Divider } from '@/lib/primevue';

// Props
const { title } = defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="col-span-12 mb-4 flex">
    <h4 class="flex-none flex items-center m-0">{{ title }}</h4>
    <Divider class="grow flex ml-6" />
  </div>
</template>
