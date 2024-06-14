<script setup lang="ts">
import { Divider } from '@/lib/primevue';

// Props
type Props = {
  title: string;
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div class="col-12 mb-3 flex">
    <h4 class="flex-none flex align-items-center m-0">{{ props.title }}</h4>
    <Divider class="flex-grow-1 flex ml-4" />
  </div>
</template>
