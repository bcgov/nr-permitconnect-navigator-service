<script setup lang="ts">
// Defaults tooltip to right if not stated.
const {
  bottom,
  left,
  icon = 'fa-solid fa-circle-info',
  right = true,
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
      <span
        v-tooltip.focus.bottom="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </span>
    </span>
    <span
      v-else-if="left"
      v-tooltip.left="text"
    >
      <span
        v-tooltip.focus.left="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </span>
    </span>
    <span
      v-else-if="top"
      v-tooltip.top="text"
    >
      <span
        v-tooltip.focus.top="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </span>
    </span>
    <span
      v-else-if="right"
      v-tooltip.right="text"
    >
      <span
        v-tooltip.focus.right="text"
        tabindex="0"
      >
        <font-awesome-icon :icon />
      </span>
    </span>
  </span>
</template>
