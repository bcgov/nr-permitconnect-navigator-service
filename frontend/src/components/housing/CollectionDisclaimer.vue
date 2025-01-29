<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Card } from '@/lib/primevue';
import Divider from '@/components/common/Divider.vue';

const { t } = useI18n();
</script>

<template>
  <Card>
    <template #title>
      <span class="section-header">Notice for collection, use and disclosure of personal information</span>
      <Divider type="solid" />
    </template>
    <template #content>
      <p class="disclaimer">
        {{ t('collectionDisclaimer.disclaimer') }}
        <!-- prettier-ignore -->
        <span>
          <a href="mailto:Navigator.Service@gov.bc.ca">Navigator.Service@gov.bc.ca</a>.
        </span>
      </p>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.disclaimer {
  font-weight: 500;
}

.p-card {
  border-color: rgb(242, 241, 241);
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  margin-bottom: 1rem;

  .section-header {
    font-weight: bold;
    padding-left: 1rem;
    padding-right: 0.5rem;
  }

  :deep(.p-card-title) {
    font-size: 1rem;
  }

  :deep(.p-card-body) {
    padding-left: 0;
    padding-right: 0;
  }

  :deep(.p-card-content) {
    padding-bottom: 0;
    padding-top: 0;

    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
