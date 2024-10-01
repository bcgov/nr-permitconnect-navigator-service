<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { useAuthNStore } from '@/store';

const authnStore = useAuthNStore();
const router = useRouter();

onMounted(async () => {
  if (authnStore.getIsAuthenticated) await authnStore.logout();

  // Return user back to home page
  router.replace('/');
});
</script>

<template>
  <h2>Logging out...</h2>
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
