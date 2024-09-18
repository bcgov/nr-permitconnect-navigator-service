<script setup lang="ts">
import { Button } from '@/lib/primevue';

// Props
const {
  index,
  activeStep,
  clickCallback = () => {},
  title,
  icon
} = defineProps<{
  index: number;
  activeStep: number;
  clickCallback?: Function;
  title: string;
  icon: string;
}>();
</script>

<template>
  <Button
    class="p-button-text"
    @click="clickCallback()"
  >
    <font-awesome-icon
      class="pr-2"
      :icon="`fa-solid ${icon}`"
    />
    <span
      class="text-xl"
      :class="{ 'font-bold': index === activeStep }"
    >
      {{ title }}
    </span>
  </Button>
</template>
