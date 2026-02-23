<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormCategoryErrors } from '@/composables/useFormCategoryErrors';
import { Message } from '@/lib/primevue';

// Composables
const { getFormCategoryErrors } = useFormCategoryErrors();
const { t } = useI18n();

// State
const hasErrors = computed(() => getFormCategoryErrors().length);
</script>

<template>
  <Message
    v-if="hasErrors"
    severity="error"
    icon="pi pi-exclamation-circle"
    :closable="false"
    class="message-banner text-center"
  >
    {{ t('validationBanner.message') }}
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
