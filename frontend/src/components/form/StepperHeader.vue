<script setup lang="ts">
import { computed } from 'vue';

import Divider from '@/components/common/Divider.vue';
import { useFormCategoryErrors } from '@/composables/useFormCategoryErrors';

import type { CallbackFn } from '@/types/index.ts';

// Props
const {
  index,
  activeStep,
  onClickCallback = () => {},
  title,
  icon,
  divider = true,
  errorCategories = []
} = defineProps<{
  index: number;
  activeStep: number;
  onClickCallback?: CallbackFn;
  title: string;
  icon: string;
  divider?: boolean;
  errorCategories?: string[];
}>();

// Composables
const { getFormCategoryErrors } = useFormCategoryErrors();

// State
const errors = computed(
  () => getFormCategoryErrors().length && errorCategories.some((field) => getFormCategoryErrors().includes(field))
);
</script>

<template>
  <div class="flex flex-col items-center">
    <button
      type="button"
      :aria-label="`Go to ${title} step`"
      class="bg-transparent border-0 inline-flex flex-col p-1 mt-1"
      :class="[{ 'outer-border': index === activeStep, 'outer-border-error': index === activeStep && errors }]"
      @click="onClickCallback()"
    >
      <span
        aria-hidden="true"
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
            {
              'app-primary-color': index > activeStep && !errors,
              'app-error-background app-error-border text-white': errors
            }
          ]"
        />
      </span>
    </button>
    <span
      aria-hidden="true"
      class="text-xl text-nowrap"
      :class="{ 'font-bold': index === activeStep, underline: index === activeStep, 'app-error-color': errors }"
    >
      {{ title }}
    </span>
  </div>
  <Divider
    v-if="divider"
    class="!mx-4"
  />
</template>

<style lang="scss" scoped>
.p-divider {
  background-color: var(--p-greyscale-100);
  height: 0.2rem;
}

.outer-border {
  border-radius: 50% !important;
  box-shadow: 0 0 0 3px var(--p-primary-300) !important;
}

.outer-border-error {
  border-radius: 50% !important;
  box-shadow: 0 0 0 3px var(--p-red-400) !important;
}
</style>
