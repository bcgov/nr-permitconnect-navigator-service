<script setup lang="ts">
import { computed } from 'vue';

// Props
const {
  enlarge = false,
  status,
  bgColor,
  borderColor,
  icon,
  contentColor = '$app-pill-text'
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
    <div
      class="flex justify-center items-center status-indicator"
      :style="{
        '--font-size': dimensions.fontSize,
        '--icon-font-size': dimensions.iconFontSize,
        '--height': dimensions.height,
        '--line-height': dimensions.lineHeight,
        backgroundColor: `${bgColor}`,
        borderColor: `${borderColor}`,
        borderWidth: `${borderColor ? '0.1rem' : '0'}`
      }"
      :aria-label="status"
    >
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

<style scoped lang="scss">
.status-indicator {
  border-radius: 0.125rem;
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
