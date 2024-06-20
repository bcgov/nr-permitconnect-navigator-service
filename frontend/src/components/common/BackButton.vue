<script setup lang="ts">
import { Button, useConfirm } from '@/lib/primevue';
import { useRouter } from 'vue-router';

// Props
type Props = {
  confirmHeader?: string;
  confirmLeave?: boolean;
  confirmMessage?: string;
  routeName: string;
  text: string;
};

const props = withDefaults(defineProps<Props>(), {
  confirmHeader: 'Leave this page?',
  confirmLeave: false,
  confirmMessage: 'Are you sure you want to leave this page?'
});

// Actions
const confirm = useConfirm();
const router = useRouter();

function onConfirmLeave() {
  confirm.require({
    message: props.confirmMessage,
    header: props.confirmHeader,
    acceptLabel: 'Leave',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => router.push({ name: props.routeName })
  });
}
</script>

<template>
  <Button
    v-if="!props.confirmLeave"
    class="p-0"
    text
  >
    <router-link :to="{ name: props.routeName }">
      <font-awesome-icon
        icon="fa fa-arrow-circle-left"
        class="mr-1 app-primary-color"
      />
      <span class="app-primary-color">{{ props.text }}</span>
    </router-link>
  </Button>
  <Button
    v-if="props.confirmLeave"
    class="p-0"
    text
    @click="onConfirmLeave"
  >
    <font-awesome-icon
      icon="fa fa-arrow-circle-left"
      class="mr-1 app-primary-color"
    />
    <span class="app-primary-color">{{ props.text }}</span>
  </Button>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}
</style>
