<script setup lang="ts">
// Defaults tooltip to right if not stated.
const {
  bottom,
  left,
  icon = 'fa-solid fa-circle-info',
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
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
  <span
    class="app-primary-color"
    role="tooltip"
    :aria-label="text"
  >
    <span
      v-if="bottom"
      v-tooltip.bottom="text"
    >
      <font-awesome-icon :icon />
    </span>
    <span
      v-else-if="left"
      v-tooltip.left="text"
    >
      <font-awesome-icon :icon />
    </span>
    <span
      v-else-if="top"
      v-tooltip.top="text"
    >
      <font-awesome-icon :icon />
    </span>
    <span
      v-else
      v-tooltip.right="text"
    >
      <font-awesome-icon :icon />
    </span>
  </span>
</template>
