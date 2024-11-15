<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';

// Store
const router = useRouter();
const toHousing = (): void => {
  router.push({ name: RouteName.HOUSING });
};
</script>

<template>
  <div class="h-screen">
    <div class="bg" />
    <div class="poly" />
    <div class="flex align-items-center justify-content-start h-full">
      <div class="text-left text-white-alpha-90">
        <h1 class="font-bold mb-0">Welcome to the</h1>
        <h1 class="font-bold mt-0">Permit Connect Services</h1>
        <h2 class="mb-3">Choose your project type</h2>
        <Button @click="toHousing">
          <font-awesome-icon
            icon="fa-solid fa-house"
            class="mr-1"
          />
          Housing
        </Button>
      </div>
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
  background-color: var(--p-primary-color);
  opacity: 0.9;
}
</style>

<style scoped lang="scss">
h1,
h2 {
  color: rgba(255, 255, 255, 0.9) !important;
}
</style>
