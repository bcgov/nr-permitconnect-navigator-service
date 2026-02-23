<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Card } from '@/lib/primevue';

// Composables
const { t } = useI18n();
</script>

<template>
  <Card>
    <template #content>
      <span class="flex font-bold">
        <i18n-t
          keypath="permitLearnCard.message"
          tag="p"
          scope="global"
        >
          <template #permitLink>
            <a
              class="no-underline"
              href="https://permitconnectbc.gov.bc.ca/#authorizations"
              target="_blank"
            >
              {{ t('permitLearnCard.links.permitConnectBc') }}
            </a>
          </template>
        </i18n-t>
      </span>
    </template>
  </Card>
</template>
