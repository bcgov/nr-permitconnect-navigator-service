<script setup lang="ts">
const {
  bottom,
  left,
  icon = 'fa-solid fa-circle-info',
  right,
  text,
  top
} = defineProps<{
  bottom?: boolean;
  left?: boolean;
  icon?: string;
  right?: boolean;
  text?: string;
  top?: boolean;
}>();
</script>

<template>
  <span class="tooltip-root">
    <div class="screen-reader-only inline-block">{{ text }}</div>

    <div
      v-if="bottom"
      v-tooltip.bottom="text"
    >
      <div
        v-tooltip.focus.bottom="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </div>
    </div>
    <div
      v-else-if="left"
      v-tooltip.left="text"
    >
      <div
        v-tooltip.focus.left="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </div>
    </div>
    <div
      v-else-if="right"
      v-tooltip.right="text"
    >
      <div
        v-tooltip.focus.right="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </div>
    </div>
    <div
      v-else-if="top"
      v-tooltip.top="text"
    >
      <div
        v-tooltip.focus.top="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </div>
    </div>
  </span>
</template>

<style lang="scss" scoped>
.tooltip-root {
  color: var(--p-primary-color);
}
</style>
