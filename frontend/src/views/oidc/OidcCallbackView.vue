<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { useAuthNStore } from '@/store';
import { StorageKey } from '@/utils/enums/application';
import { loadAuthenticatedContext } from '@/utils/bootstrap';

// Composables
const router = useRouter();

// Actions
onMounted(async () => {
  const authnStore = useAuthNStore();

  await authnStore.loginCallback();

  await loadAuthenticatedContext();

  // Return user back to original login entrypoint if specified
  const entrypoint = globalThis.sessionStorage.getItem(StorageKey.AUTH);
  if (entrypoint) globalThis.sessionStorage.removeItem(StorageKey.AUTH);
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
