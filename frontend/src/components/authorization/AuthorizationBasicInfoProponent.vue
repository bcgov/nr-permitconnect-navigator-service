<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { userService } from '@/services';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Composables
const { t } = useI18n();

// State
const cardUpdatedBy: Ref<string> = ref('');

// Actions
watchEffect(() => {
  if (permit.updatedBy) {
    userService
      .searchUsers({ userId: [permit.updatedBy] })
      .then((res) => {
        cardUpdatedBy.value = res?.data.length ? res?.data[0].fullName : '';
      })
      .catch(() => {});
  }
});
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <div class="border-color px-4 py-5 border border-[0.063rem]">
      <div>
        <b>{{ t('authorization.authorizationBasicInfoProponent.applicationId') }}:</b>
        <span class="ml-1">
          {{ permit?.permitTracking?.find((x) => x.shownToProponent)?.trackingId }}
        </span>
      </div>
      <div class="mt-5">
        <b>{{ t('authorization.authorizationBasicInfoProponent.agency') }}:</b>
        <span class="ml-1">
          {{ permit?.permitType.agency }}
        </span>
      </div>
    </div>
    <div class="border-color px-4 py-5 border border-[0.063rem]">
      <div>
        <b>{{ t('authorization.authorizationBasicInfoProponent.submittedDate') }}:</b>
        <span class="ml-1">
          {{ formatDate(permit?.submittedDate) }}
        </span>
      </div>
      <!-- To be enabled later -->
      <!-- <div class="mt-5">
        <b>{{ t('authorization.authorizationBasicInfoProponent.avgProcessingTime') }}:</b>
        <font-awesome-icon
          class="cursor-pointer app-primary-color ml-1"
          icon="fa-circle-question"
        />
      </div> -->
    </div>
    <div class="border-color px-4 py-5 border border-[0.063rem]">
      <div>
        <b>{{ t('authorization.authorizationBasicInfoProponent.decisionDate') }}:</b>
        <span class="ml-1">
          <span v-if="permit.adjudicationDate">
            {{ formatDate(permit.adjudicationDate) }}
          </span>
          <span v-else>{{ t('authorization.authorizationBasicInfoProponent.uponDecision') }}</span>
        </span>
      </div>
      <div class="mt-5">
        <a
          href="https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/natural-resource-permits/permit-connect-bc/permit-connect-bc-housing#BC-government-permitting"
          target="_blank"
        >
          {{ t('authorization.authorizationBasicInfoProponent.learnMore') }}
        </a>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.border-color {
  border-color: $app-proj-white-one;
}
</style>
