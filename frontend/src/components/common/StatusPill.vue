<script setup lang="ts">
import { computed } from 'vue';

// Props
const {
  enlarge = false,
  stage,
  bgColor,
  borderColor,
  icon,
  contentColor = 'var(--p-greyscale-900)'
} = defineProps<{
  enlarge?: boolean;
  stage?: string;
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
    <div
      class="flex justify-center items-center status-indicator rounded"
      :style="{
        '--font-size': dimensions.fontSize,
        '--icon-font-size': dimensions.iconFontSize,
        '--height': dimensions.height,
        '--line-height': dimensions.lineHeight,
        ...(bgColor ? { backgroundColor: `${bgColor}` } : {}),
        ...(borderColor ? { borderColor: `${borderColor}`, borderWidth: '0.1rem' } : { borderWidth: '0' })
      }"
      :aria-label="stage"
    >
      <font-awesome-icon
        v-if="icon"
        :icon="icon"
        :style="{ fontSize: dimensions.iconFontSize, color: `${contentColor}` }"
        class="mr-2"
      />
      <span :style="{ color: `${contentColor}` }">{{ stage }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.status-indicator {
  border-style: solid;
  font-size: var(--font-size);
  height: var(--height);
  line-height: var(--line-height);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  cursor: default;
  text-align: center;
}
</style>
