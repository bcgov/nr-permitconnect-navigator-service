<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';

// Store
const router = useRouter();
const toStart = (): void => {
  router.push({ name: RouteNames.START });
};
</script>

<template>
  <div class="bg" />
  <div class="poly" />
  <div class="flex align-items-center justify-content-start h-full">
    <div class="text-left text-white-alpha-90">
      <h1 class="font-bold mb-0">Welcome to the</h1>
      <h1 class="font-bold underline mt-0">Permit Connect Services</h1>
      <h2 class="mb-3">Choose an initiative</h2>
      <Button @click="toStart">
        <font-awesome-icon
          icon="fa-solid fa-house"
          class="mr-1"
        />
        Housing
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bg {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1000;
  background: url('../assets/images/home-bg.avif') no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
}

.poly {
  clip-path: polygon(0% 0%, 55% 0%, 45% 100%, 0% 100%);
  z-index: -500;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $app-primary;
  opacity: 0.8;
}

.p-button {
  border-width: 2px;
  &:not(.p-button-secondary, .p-button-success, .p-button-info, .p-button-warning, .p-button-help, .p-button-danger) {
    color: $app-primary;
    &:not(.p-button-outlined, .p-button-text) {
      background-color: white;
      border-color: white;
      color: $app-primary;
    }
  }
}
</style>
