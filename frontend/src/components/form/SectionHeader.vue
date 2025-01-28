<script setup lang="ts">
import { Divider } from '@/lib/primevue';

// Props
const { title } = defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="col-span-12 mb-4 flex items-center">
    <h4 class="flex-none m-0 pr-4">{{ title }}</h4>
    <Divider aria-hidden="true" />
  </div>
</template>
