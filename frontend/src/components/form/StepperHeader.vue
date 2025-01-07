<script setup lang="ts">
import { Button, Divider } from '@/lib/primevue';

// Props
const {
  index,
  activeStep,
  clickCallback = () => {},
  title,
  icon,
  errors = false,
  divider = true
} = defineProps<{
  index: number;
  activeStep: number;
  clickCallback?: Function;
  title: string;
  icon: string;
  errors?: boolean;
  divider?: boolean;
}>();
</script>

<template>
  <div class="flex flex-col flex-auto items-center">
    <Button
      class="bg-transparent border-0 inline-flex flex-col gap-2 p-1"
      :class="[{ 'outer-border': index === activeStep, 'outer-border-error': index === activeStep && errors }]"
      @click="clickCallback()"
    >
      <span
        class="rounded-full border-2 w-12 h-12 inline-flex items-center justify-center"
        :class="[
          {
            'bg-primary text-primary-contrast border-primary': index <= activeStep,
            'border-surface': index > activeStep,
            'border-1, p-6': index === activeStep,
            'app-error-background app-error-border': errors
          }
        ]"
      >
        <font-awesome-icon
          :icon="`fa-solid ${icon}`"
          :class="[
            { 'app-primary-color': index > activeStep && !errors, 'app-error-background app-error-border': errors }
          ]"
        />
      </span>
    </Button>
    <span
      class="text-xl"
      :class="{ 'font-bold': index === activeStep, underline: index === activeStep, 'app-error-color': errors }"
    >
      {{ title }}
    </span>
  </div>
  <Divider v-if="divider" />
</template>

<style lang="scss" scoped>
.outer-border {
  border-radius: 50%;
  box-shadow: 0 0 0 3px #c1ddfc; // TODO: Blue 30
}

.outer-border-error {
  border-radius: 50%;
  box-shadow: 0 0 0 3px $app-error !important;
}
</style>
