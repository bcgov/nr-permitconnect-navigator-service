<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { Button } from '@/lib/primevue';
import { useAuthNStore } from '@/store';
import { RouteName } from '@/utils/enums/application';

// Store
const authnStore = useAuthNStore();
const { getIsAuthenticated } = storeToRefs(authnStore);

// Actions
const { t } = useI18n();
const router = useRouter();

function isLoginEnabled() {
  return (
    !getIsAuthenticated &&
    router.currentRoute.value.name &&
    ![RouteName.HOME, RouteName.OIDC_LOGIN, RouteName.OIDC_CALLBACK, RouteName.OIDC_LOGOUT].includes(
      router.currentRoute.value.name as any
    )
  );
}

function login() {
  router.push({ name: RouteName.OIDC_LOGIN });
}

function logout() {
  router.push({ name: RouteName.OIDC_LOGOUT });
}
</script>

<template>
  <Button
    v-if="isLoginEnabled()"
    outlined
    severity="primary"
    @click="login()"
  >
    {{ t('loginButton.login') }}
  </Button>
  <Button
    v-else-if="getIsAuthenticated"
    outlined
    severity="primary"
    @click="logout()"
  >
    {{ t('loginButton.logout') }}
  </Button>
</template>

<style scoped>
button {
  /* color: white !important; */
  /* border-width: 2px !important; */
}
</style>
