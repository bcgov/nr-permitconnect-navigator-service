<script setup lang="ts">
import { onMounted, ref } from 'vue';

import ShasIntakeForm from '@/components/intake/ShasIntakeForm.vue';

import type { Ref } from 'vue';

// State
const loading: Ref<boolean> = ref(true);

// Actions
onMounted(async () => {
  loading.value = false;
});
</script>

<template>
  <ShasIntakeForm />
</template>
