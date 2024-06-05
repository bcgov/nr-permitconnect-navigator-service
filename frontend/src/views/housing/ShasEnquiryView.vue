<script setup lang="ts">
import { onMounted, ref } from 'vue';

import ShasEnquiryForm from '@/components/housing/intake/ShasEnquiryForm.vue';

import type { Ref } from 'vue';

// State
const loading: Ref<boolean> = ref(true);

// Actions
onMounted(async () => {
  loading.value = false;
});
</script>

<template>
  <ShasEnquiryForm />
</template>
