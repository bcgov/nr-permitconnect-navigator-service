<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Message } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';

// Composables
const { t } = useI18n();
</script>

<template>
  <div>
    <h2 class="mb-9">
      {{ t('e.common.enquiryConfirmationView.confirmationHeader') }}
    </h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('e.common.enquiryConfirmationView.confirmationBanner') }}
    </Message>
    <div class="mt-9">
      {{ t('e.electrification.enquiryConfirmationView.message') }}
    </div>
    <div class="mt-7">
      <router-link :to="{ name: RouteName.EXT_ELECTRIFICATION }">
        {{ t('e.electrification.projectConfirmationView.backToElectrification') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inline-block {
  display: inline-block;
}
</style>
