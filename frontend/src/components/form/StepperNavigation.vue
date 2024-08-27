<script setup lang="ts">
import { nextTick } from 'vue';
import { Button } from '@/lib/primevue';

// Props
type Props = {
  editable: boolean;
  nextCallback?: Function;
  nextDisabled?: boolean;
  prevCallback?: Function;
  prevDisabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  nextCallback: () => {},
  nextDisabled: false,
  prevCallback: () => {},
  prevDisabled: false
});

function scrollToTop() {
  const stepperPanel = document.querySelector('.p-stepper');
  if (stepperPanel) {
    window.scroll(0, 0);
  }
}

function handleNextClick() {
  props.nextCallback?.();
  nextTick(() => scrollToTop());
}

function handlePrevClick() {
  props.prevCallback?.();
  nextTick(() => scrollToTop());
}
</script>

<template>
  <div class="flex pt-4 justify-content-between">
    <Button
      class="px-4 py-1"
      outlined
      icon="pi pi-arrow-left"
      icon-class="text-xl"
      :disabled="props.prevDisabled"
      @click="handlePrevClick"
    />
    <slot name="content" />
    <Button
      class="px-4 py-1"
      outlined
      icon="pi pi-arrow-right"
      icon-class="text-xl"
      :disabled="props.nextDisabled"
      @click="handleNextClick"
    />
  </div>
</template>
