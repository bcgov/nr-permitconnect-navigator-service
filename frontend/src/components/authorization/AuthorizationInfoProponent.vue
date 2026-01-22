<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { formatDateOnly } from '@/utils/formatters';

import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <div class="border-color px-4 py-5 border border-[0.063rem]">
      <div>
        <b>{{ t('authorization.authorizationInfoProponent.applicationId') }}:</b>
        <span class="ml-1">
          {{ permit?.permitTracking?.find((x) => x.shownToProponent)?.trackingId }}
        </span>
      </div>
      <div class="mt-5">
        <b>{{ t('authorization.authorizationInfoProponent.agency') }}:</b>
        <span class="ml-1">
          {{ permit?.permitType.agency }}
        </span>
      </div>
    </div>
    <div class="border-color px-4 py-5 border border-[0.063rem]">
      <div>
        <b>{{ t('authorization.authorizationInfoProponent.submittedDate') }}:</b>
        <span class="ml-1">
          {{ formatDateOnly(permit?.submittedDate) }}
        </span>
      </div>
      <!-- TODO: To be enabled in PADS-611, currently we do not have the processing time in db-->
      <!-- <div class="mt-5">
        <b>{{ t('authorization.authorizationInfoProponent.avgProcessingTime') }}:</b>
        <font-awesome-icon
          class="cursor-pointer app-primary-color ml-1"
          icon="fa-circle-question"
        />
      </div> -->
    </div>
    <div class="border-color px-4 py-5 border border-[0.063rem]">
      <div>
        <b>{{ t('authorization.authorizationInfoProponent.decisionDate') }}:</b>
        <span class="ml-1">
          <span v-if="permit.decisionDate">
            {{ formatDateOnly(permit.decisionDate) }}
          </span>
          <span v-else>{{ t('authorization.authorizationInfoProponent.uponDecision') }}</span>
        </span>
      </div>
      <div class="mt-5">
        <a
          href="https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/natural-resource-permits/permit-connect-bc/permit-connect-bc-housing#BC-government-permitting"
          target="_blank"
        >
          {{ t('authorization.authorizationInfoProponent.learnMore') }}
        </a>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.border-color {
  border-color: var(--p-greyscale-100);
}
</style>
