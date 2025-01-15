<script setup lang="ts">
import { Message } from '@/lib/primevue';

import { RouteName } from '@/utils/enums/application';

// Props
const {
  activityId,
  enquiryId,
  showHeader = true,
  showHomeLink = true
} = defineProps<{
  activityId: string;
  enquiryId: string;
  showHeader?: boolean;
  showHomeLink?: boolean;
}>();
</script>

<template>
  <div>
    <h2 v-if="showHeader">Confirmation of Submission</h2>
    <Message
      severity="success"
      :closable="false"
    >
      Your enquiry has been successfully submitted.
    </Message>
    <h3 class="inline-block my-7 mr-2">Enquiry ID:</h3>
    <router-link
      :to="{
        name: RouteName.HOUSING_ENQUIRY_INTAKE,
        query: { activityId: activityId, enquiryId: enquiryId }
      }"
    >
      <span class="text-2xl">{{ activityId }}</span>
    </router-link>
    <div>
      A Housing Navigator will review your submission and contact you in 2 business days. Please check your email for
      the confirmation email and keep the enquiry ID for future reference.
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
