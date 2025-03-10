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
</style>
