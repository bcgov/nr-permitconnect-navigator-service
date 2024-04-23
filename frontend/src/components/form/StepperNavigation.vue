<script setup lang="ts">
import { Button } from '@/lib/primevue';

// Props
type Props = {
  editable: boolean;
  nextCallback?: Function;
  nextDisabled?: boolean;
  prevCallback?: Function;
  prevDisabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  nextCallback: () => {},
  nextDisabled: false,
  prevCallback: () => {},
  prevDisabled: false
});
</script>

<template>
  <div class="flex pt-4 justify-content-between">
    <Button
      class="px-4 py-1"
      outlined
      icon="pi pi-arrow-left"
      icon-class="text-xl"
      :disabled="props.prevDisabled"
      @click="props.prevCallback()"
    />
    <Button
      class="p-button-sm"
      outlined
      label="Save draft"
      type="submit"
      :disabled="!editable"
    />
    <Button
      class="px-4 py-1"
      outlined
      icon="pi pi-arrow-right"
      icon-class="text-xl"
      :disabled="props.nextDisabled"
      @click="props.nextCallback()"
    />
  </div>
</template>
