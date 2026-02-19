<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { Button, useToast } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { useAuthNStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';

// Composables
const { t } = useI18n();
const toast = useToast();
const router = useRouter();

// Store
const authNStore = useAuthNStore();
const authZStore = useAuthZStore();

// Actions
const toElectrification = (): void => {
  if (authNStore.getIsAuthenticated) {
    if (authZStore.canNavigate(NavigationPermission.INT_ELECTRIFICATION))
      router.push({ name: RouteName.INT_ELECTRIFICATION });
    else if (authZStore.canNavigate(NavigationPermission.EXT_ELECTRIFICATION))
      router.push({ name: RouteName.EXT_ELECTRIFICATION });
    else {
      toast.warn(t('views.homeView.cantNavigate'));
    }
  } else {
    router.push({ name: RouteName.EXT_ELECTRIFICATION });
  }
};

const toGeneral = (): void => {
  if (authNStore.getIsAuthenticated) {
    if (authZStore.canNavigate(NavigationPermission.INT_GENERAL)) router.push({ name: RouteName.INT_GENERAL });
    else if (authZStore.canNavigate(NavigationPermission.EXT_GENERAL)) router.push({ name: RouteName.EXT_GENERAL });
    else {
      toast.warn(t('views.homeView.cantNavigate'));
    }
  } else {
    router.push({ name: RouteName.EXT_GENERAL });
  }
};

const toHousing = (): void => {
  if (authNStore.getIsAuthenticated) {
    if (authZStore.canNavigate(NavigationPermission.INT_HOUSING)) router.push({ name: RouteName.INT_HOUSING });
    else if (authZStore.canNavigate(NavigationPermission.EXT_HOUSING)) router.push({ name: RouteName.EXT_HOUSING });
    else {
      toast.warn(t('views.homeView.cantNavigate'));
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
        <h3>{{ t('views.homeView.welcome') }}</h3>
        <h1 class="!mt-0">{{ t('views.homeView.pcns') }}</h1>
        <h3 class="mb-7">{{ t('views.homeView.chooseProject') }}</h3>
        <div class="space-x-4">
          <Button @click="toHousing">
            <img
              class="mr-4"
              src="@/assets/images/H.Land.Button.svg"
              alt="Housing image"
            />
            {{ t('views.homeView.housing') }}
          </Button>
          <Button @click="toElectrification">
            <img
              class="mr-4"
              src="@/assets/images/E.Land.Button.svg"
              alt="Electrification image"
            />
            {{ t('views.homeView.electrification') }}
          </Button>
          <Button @click="toGeneral">
            <img
              class="mr-4"
              src="@/assets/images/G.Land.Button.svg"
              alt="General image"
            />
            {{ t('views.homeView.general') }}
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
  width: 12.5rem;
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
