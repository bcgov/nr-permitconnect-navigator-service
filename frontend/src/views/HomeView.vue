<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { Button, useToast } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { useAuthNStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';

// Store
const router = useRouter();

// State
const { t } = useI18n();
const toast = useToast();

// Actions
const toElectrification = (): void => {
  if (useAuthNStore().getIsAuthenticated) {
    if (useAuthZStore().canNavigate(NavigationPermission.INT_ELECTRIFICATION))
      router.push({ name: RouteName.INT_ELECTRIFICATION });
    else if (useAuthZStore().canNavigate(NavigationPermission.EXT_ELECTRIFICATION))
      router.push({ name: RouteName.EXT_ELECTRIFICATION });
    else {
      toast.warn(t('homeView.cantNavigate'));
    }
  } else {
    router.push({ name: RouteName.EXT_ELECTRIFICATION });
  }
};

const toHousing = (): void => {
  if (useAuthNStore().getIsAuthenticated) {
    if (useAuthZStore().canNavigate(NavigationPermission.INT_HOUSING)) router.push({ name: RouteName.INT_HOUSING });
    else if (useAuthZStore().canNavigate(NavigationPermission.EXT_HOUSING))
      router.push({ name: RouteName.EXT_HOUSING });
    else {
      toast.warn(t('homeView.cantNavigate'));
    }
  } else {
    router.push({ name: RouteName.EXT_HOUSING });
  }
};
</script>

<template>
  <div class="h-screen">
    <div class="bg" />
    <div class="poly" />
    <div class="flex items-center justify-start h-full">
      <div class="text-left">
        <h3>{{ t('homeView.welcome') }}</h3>
        <h1 class="!mt-0">{{ t('homeView.pcns') }}</h1>
        <h3 class="mb-7">{{ t('homeView.chooseProject') }}</h3>
        <div class="space-x-4">
          <Button @click="toHousing">
            <img
              class="mr-4"
              src="@/assets/images/H.Land.Button.svg"
              alt="Housing image"
            />
            {{ t('homeView.housing') }}
          </Button>
          <Button @click="toElectrification">
            <img
              class="mr-4"
              src="@/assets/images/E.Land.Button.svg"
              alt="Electrification image"
            />
            {{ t('homeView.electrification') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
h1,
h3 {
  color: rgba(255, 255, 255, 0.9) !important;
}

h3 {
  font-weight: 400;
}

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

.p-button {
  border-width: 2px;
  &:not(.p-button-secondary, .p-button-success, .p-button-info, .p-button-warning, .p-button-help, .p-button-danger) {
    color: var(--p-primary-color);
    &:not(.p-button-outlined, .p-button-text) {
      background-color: white;
      border-color: white;
      color: var(--p-primary-color);
    }
    &:hover {
      background-color: var(--p-greyscale-200);
    }
  }
}
</style>
