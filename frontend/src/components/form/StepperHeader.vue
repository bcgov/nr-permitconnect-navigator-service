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
  <div class="flex flex-column align-items-center">
    <Button
      class="bg-transparent border-none inline-flex flex-column gap-2 p-1"
      :class="[{ 'outer-border': index === activeStep }]"
      @click="clickCallback()"
    >
      <span
        class="border-circle border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center"
        :class="[
          {
            'bg-primary border-primary': index <= activeStep,
            'surface-border': index > activeStep,
            'border-1, p-4': index === activeStep
          }
        ]"
      >
        <font-awesome-icon
          :icon="`fa-solid ${icon}`"
          :class="[{ 'app-primary-color': index > activeStep }]"
        />
      </span>
    </Button>
    <span
      class="text-xl"
      :class="{ 'font-bold': index === activeStep, underline: index === activeStep }"
    >
      {{ title }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.outer-border {
  border-radius: 50%;
  box-shadow: 0 0 0 3px #c1ddfc; // TODO: Blue 30
}
</style>
