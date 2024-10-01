<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { useAuthNStore, useAuthZStore } from '@/store';
import { StorageKey } from '@/utils/enums/application';
import { storeToRefs } from 'pinia';
import { yarsService } from '@/services';

const authnStore = useAuthNStore();
const router = useRouter();

const { getIsAuthenticated } = storeToRefs(useAuthNStore());

onMounted(async () => {
  await authnStore.loginCallback();

  if (getIsAuthenticated.value) {
    const permissions = await yarsService.getPermissions();
    useAuthZStore().setPermissions(permissions.data);
  }

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
