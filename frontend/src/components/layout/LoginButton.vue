<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { Button } from '@/lib/primevue';
import { useAuthStore } from '@/store/authStore';
import { RouteNames } from '@/utils/constants';

// Store
const authStore = useAuthStore();
const { getIsAuthenticated } = storeToRefs(authStore);

// Actions
const router = useRouter();

function isLoginEnabled() {
  return (
    !getIsAuthenticated &&
    router.currentRoute.value.name &&
    ![RouteNames.HOME, RouteNames.OIDC_LOGIN, RouteNames.OIDC_CALLBACK, RouteNames.OIDC_LOGOUT].includes(
      router.currentRoute.value.name as any
    )
  );
}

function login() {
  router.push({ name: RouteNames.OIDC_LOGIN });
}

function logout() {
  router.push({ name: RouteNames.OIDC_LOGOUT });
}
</script>

<template>
  <Button
    v-if="isLoginEnabled()"
    severity="secondary"
    outlined
    @click="login()"
  >
    Log in
  </Button>
  <Button
    v-else-if="getIsAuthenticated"
    severity="secondary"
    outlined
    @click="logout()"
  >
    Log out
  </Button>
</template>

<style scoped>
button {
  color: white !important;
}
</style>
