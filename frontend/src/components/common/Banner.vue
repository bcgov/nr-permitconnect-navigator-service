<script setup lang="ts">
// Props
const { content } = defineProps<{
  content: string;
}>();
</script>

<template>
  <div
    v-if="content"
    class="bg-[var(--p-gold-100)] border rounded-sm border-[var(--p-gold-900)] px-4 py-2"
  >
    <div class="truncate">{{ content }}</div>
  </div>
</template>
