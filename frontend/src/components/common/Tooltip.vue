<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

// Actions
const { t } = useI18n();
const { down, left, right, text, up } = defineProps<{
  down?: boolean;
  left?: boolean;
  right?: boolean;
  text?: string;
  up?: boolean;
}>();

const direction = computed(() => {
  if (down) return 'down';
  else return 'up';
});
</script>

<template>
  <div
    v-tooltip="{ value: text, modifier: direction }"
    v-tooltip.focus="{ value: text, modifier: direction }"
  >
    <div
      v-tooltip="{ value: text, modifier: direction }"
      v-tooltip.focus="{ value: text, modifier: direction }"
      tabindex="0"
    >
      <font-awesome-icon icon="fa-solid fa-circle-info" />
    </div>
  </div>
</template>
