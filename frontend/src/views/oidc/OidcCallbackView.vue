<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { yarsService } from '@/services';
import { useAuthStore, usePermissionStore } from '@/store';
import { StorageKey } from '@/utils/enums/application';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  await authStore.loginCallback();

  // Get front end permissions
  const permissions = await yarsService.getPermissions();
  console.log(permissions);
  usePermissionStore().setPermissions(permissions.data);

  // Return user back to original login entrypoint if specified
  const entrypoint = window.sessionStorage.getItem(StorageKey.AUTH);
  if (entrypoint) window.sessionStorage.removeItem(StorageKey.AUTH);
  router.replace(entrypoint || '/');
});
</script>

<template>
  <h2>Authorizing...</h2>
  <Spinner />
</template>

<style lang="scss" scoped>
h2 {
  margin-top: 10rem;
  text-align: center;
}

.p-progress-spinner {
  display: flex;
  margin-top: 4rem;
  position: relative;
}
</style>
