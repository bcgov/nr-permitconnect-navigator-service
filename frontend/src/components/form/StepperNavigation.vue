<script setup lang="ts">
import { nextTick } from 'vue';
import { Button } from '@/lib/primevue';

// Props
const {
  nextCallback = () => {},
  nextDisabled = false,
  prevCallback = () => {},
  prevDisabled = false
} = defineProps<{
  nextCallback?: Function;
  nextDisabled?: boolean;
  prevCallback?: Function;
  prevDisabled?: boolean;
}>();

// Actions
function scrollToTop() {
  // TODO (still p-stepper or p-steps after rename??)
  const stepperPanel = document.querySelector('.p-stepper');
  if (stepperPanel) {
    window.scroll(0, 0);
  }
}

function handleNextClick() {
  nextCallback?.();
  nextTick(() => scrollToTop());
}

function handlePrevClick() {
  prevCallback?.();
  nextTick(() => scrollToTop());
}
</script>

<template>
  <div class="flex pt-4 justify-content-between">
    <Button
      aria-label="Go to previous page"
      :class="prevDisabled ? 'button-hidden' : 'button-visible'"
      class="px-4 py-1"
      outlined
      icon="pi pi-arrow-left"
      icon-class="text-xl"
      :disabled="prevDisabled"
      @click="handlePrevClick"
    />
    <slot name="content" />
    <Button
      aria-label="Go to next page"
      :class="nextDisabled ? 'button-hidden' : 'button-visible'"
      class="px-4 py-1"
      outlined
      icon="pi pi-arrow-right"
      icon-class="text-xl"
      :disabled="nextDisabled"
      @click="handleNextClick"
    />
  </div>
</template>

<style scoped lang="scss">
.button-visible {
  visibility: visible;
}
.button-hidden {
  visibility: hidden;
}
</style>
