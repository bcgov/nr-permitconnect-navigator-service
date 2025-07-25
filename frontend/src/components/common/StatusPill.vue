<script setup lang="ts">
import { computed } from 'vue';

// Props
const { enlarge = false, status } = defineProps<{
  enlarge?: boolean;
  status?: string;
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
    <div
      class="flex justify-center items-center status-indicator bg-[var(--p-bcblue-50)] border-[var(--p-bcblue-900)]"
      :style="{
        '--font-size': dimensions.fontSize,
        '--icon-font-size': dimensions.iconFontSize,
        '--height': dimensions.height,
        '--line-height': dimensions.lineHeight
      }"
      :aria-label="status"
    >
      <span class="text-color">{{ status }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.status-indicator {
  border-radius: 0.125rem;
  border-style: solid;
  border-width: 0.1rem;
  font-size: var(--font-size);
  height: var(--height);
  line-height: var(--line-height);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  cursor: default;
  text-align: center;
}
</style>
