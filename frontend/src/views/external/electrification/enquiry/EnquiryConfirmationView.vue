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
      {{ t('e.housing.enquiryConfirmationView.confirmationHeader') }}
    </h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('e.housing.enquiryConfirmationView.confirmationBanner') }}
    </Message>
    <div class="mt-9">
      {{ t('e.housing.enquiryConfirmationView.confirmationMsg') }}
    </div>
    <div class="mt-7">
      <router-link :to="{ name: RouteName.EXT_HOUSING }">
        {{ t('e.housing.enquiryConfirmationView.linkSubmissions') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inline-block {
  display: inline-block;
}
</style>
