<script setup lang="ts">
import { onMounted } from 'vue';

import { Spinner } from '@/components/layout';
import { useAuthNStore } from '@/store';

const authnStore = useAuthNStore();

onMounted(() => {
  authnStore.login();
});
</script>

<template>
  <h2>Logging in...</h2>
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
