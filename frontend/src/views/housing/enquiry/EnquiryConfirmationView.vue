<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Message } from '@/lib/primevue';

import { RouteName } from '@/utils/enums/application';

// Props
const {
  activityId,
  enquiryId,
  showEnquiryLink = undefined,
  showHeader = true,
  showHomeLink = true
} = defineProps<{
  activityId: string;
  enquiryId: string;
  showEnquiryLink: string;
  showHeader?: boolean;
  showHomeLink?: boolean;
}>();

// Store
const { t } = useI18n();
</script>

<template>
  <div>
    <h2
      v-if="showHeader"
      class="mb-9"
    >
      Confirmation of Submission
    </h2>
    <Message
      severity="success"
      :closable="false"
    >
      Your enquiry has been successfully submitted.
    </Message>
    <div v-if="showEnquiryLink">
      <h3 class="inline-block my-7 mr-2">Enquiry ID:</h3>
      <router-link
        :to="{
          name: RouteName.HOUSING_ENQUIRY_INTAKE,
          query: { activityId: activityId, enquiryId: enquiryId }
        }"
      >
        <span class="text-2xl">{{ activityId }}</span>
      </router-link>
    </div>
    <div class="mt-2">
      {{ t('enquiryConfirmationView.confirmationMsg') }}
    </div>
    <div
      v-if="showHomeLink"
      class="mt-7"
    >
      <router-link :to="{ name: RouteName.HOUSING }">Back to Housing</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inline-block {
  display: inline-block;
}
</style>
