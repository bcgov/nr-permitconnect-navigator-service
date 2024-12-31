<script setup lang="ts">
import { Button, useConfirm } from '@/lib/primevue';
import { useRouter } from 'vue-router';

// Props
const {
  confirmHeader = 'Leave this page?',
  confirmLeave = false,
  confirmMessage = 'Are you sure you want to leave this page?',
  routeName,
  text
} = defineProps<{
  confirmHeader?: string;
  confirmLeave?: boolean;
  confirmMessage?: string;
  routeName: string;
  text: string;
}>();

// Actions
const confirm = useConfirm();
const router = useRouter();

function onConfirmLeave() {
  confirm.require({
    message: confirmMessage,
    header: confirmHeader,
    acceptLabel: 'Leave',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => router.push({ name: routeName })
  });
}
</script>

<template>
  <Button
    v-if="!confirmLeave"
    class="p-0"
    text
    @click="router.push({ name: routeName })"
  >
    <font-awesome-icon
      icon="fa fa-arrow-circle-left"
      class="mr-1 app-primary-color"
    />
    <span class="app-primary-color">{{ text }}</span>
  </Button>
  <Button
    v-if="confirmLeave"
    class="p-0"
    text
    @click="onConfirmLeave"
  >
    <font-awesome-icon
      icon="fa fa-arrow-circle-left"
      class="mr-1 app-primary-color"
    />
    <span class="app-primary-color">{{ text }}</span>
  </Button>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}
</style>
