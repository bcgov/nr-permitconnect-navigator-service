<script setup lang="ts">
import { Button } from '@/lib/primevue';

// Props
type Props = {
  index: number;
  activeStep: number;
  clickCallback?: Function;
  title: string;
  icon: string;
};

const props = withDefaults(defineProps<Props>(), {
  clickCallback: () => {}
});
</script>

<template>
  <Button
    class="p-button-text"
    @click="props.clickCallback()"
  >
    <font-awesome-icon
      class="pr-2"
      :icon="`fa-solid ${props.icon}`"
    />
    <span
      class="text-xl"
      :class="{ 'font-bold': props.index === props.activeStep }"
    >
      {{ props.title }}
    </span>
  </Button>
</template>
