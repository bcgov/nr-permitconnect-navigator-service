<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { DemoButtons, DemoDataTable, DemoHeadings, DemoModals, DemoToasts } from '@/components/demo';
import { Message } from '@/lib/primevue';
import { useConfigStore } from '@/store';

// Store
const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <Message
    v-if="getConfig?.notificationBanner"
    severity="warn"
  >
    {{ getConfig?.notificationBanner }}
  </Message>

  <DemoHeadings />
  <DemoButtons />
  <DemoDataTable />
  <DemoModals />
  <DemoToasts />

  <div class="pb-5" />
</template>
