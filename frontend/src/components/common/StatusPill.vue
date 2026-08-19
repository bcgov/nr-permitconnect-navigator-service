<script setup lang="ts">
import { computed } from 'vue';

// Props
const {
  enlarge = false,
  status = undefined,
  bgColor = undefined,
  borderColor = undefined,
  icon = undefined,
  contentColor = 'var(--p-greyscale-900)'
} = defineProps<{
  enlarge?: boolean;
  status?: string;
  bgColor?: string;
  borderColor?: string;
  icon?: string;
  contentColor?: string;
}>();

const defaultDimensions = {
  fontSize: '0.75rem',
  height: '1.5rem',
  iconFontSize: '1rem',
  lineHeight: '1.5rem'
};
const enlargedDimensions = {
  fontSize: '1rem',
  height: '2rem',
  iconFontSize: '1.5rem',
  lineHeight: '2rem'
};

const dimensions = computed(() => (enlarge ? enlargedDimensions : defaultDimensions));
</script>

<template>
  <div class="flex">
    <!-- eslint-disable max-len -->
    <div
      class="flex justify-center items-center rounded-sm border-solid text-[length:var(--font-size)] h-[var(--height)] leading-[var(--line-height)] px-2 cursor-default text-center"
      :style="{
        '--font-size': dimensions.fontSize,
        '--icon-font-size': dimensions.iconFontSize,
        '--height': dimensions.height,
        '--line-height': dimensions.lineHeight,
        ...(bgColor ? { backgroundColor: `${bgColor}` } : {}),
        ...(borderColor ? { borderColor: `${borderColor}`, borderWidth: '0.1rem' } : { borderWidth: '0' })
      }"
      :aria-label="status"
    >
      <!-- eslint-enable max-len -->
      <font-awesome-icon
        v-if="icon"
        :icon="icon"
        :style="{ fontSize: dimensions.iconFontSize, color: `${contentColor}` }"
        class="mr-2"
      />
      <span :style="{ color: `${contentColor}` }">{{ status }}</span>
    </div>
  </div>
</template>
