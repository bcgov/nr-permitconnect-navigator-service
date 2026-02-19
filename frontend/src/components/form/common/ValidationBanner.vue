<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Message } from '@/lib/primevue';

// Props
const { validationErrors } = defineProps<{
  validationErrors: (string | undefined)[];
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <Message
    v-if="validationErrors.length"
    severity="error"
    icon="pi pi-exclamation-circle"
    :closable="false"
    class="message-banner text-center"
  >
    {{ t('projectIntakeForm.validationBanner') }}
  </Message>
</template>

<style lang="scss" scoped>
.message-banner {
  border-left-color: var(--p-red-500);
  border-left-width: 5px;
  border-left-style: solid;
  border-radius: 3px;
  margin-bottom: 1rem;

  :deep(.p-message-content) {
    padding: 0.5rem;
    background-color: var(--p-red-50) !important;
  }
}
</style>
