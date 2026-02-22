<script setup lang="ts">
import { nextTick } from 'vue';

import { Button } from '@/lib/primevue';

import type { CallbackFn } from '@/types';

// Props
const {
  nextCallback = () => {},
  nextDisabled = false,
  prevCallback = () => {},
  prevDisabled = false
} = defineProps<{
  nextCallback?: CallbackFn;
  nextDisabled?: boolean;
  prevCallback?: CallbackFn;
  prevDisabled?: boolean;
}>();

// Actions
function scrollToTop() {
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
  <div class="flex pt-6 justify-between">
    <Button
      aria-label="Go to previous page"
      :class="prevDisabled ? 'button-hidden' : 'button-visible'"
      class="px-6 py-1"
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
      class="px-6 py-1"
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
