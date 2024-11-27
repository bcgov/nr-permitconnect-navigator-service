<script setup lang="ts">
import { Message } from '@/lib/primevue';

import { RouteName } from '@/utils/enums/application';

// Props
const { assignedActivityId, assignedEnquiryId } = defineProps<{
  assignedActivityId: string;
  assignedEnquiryId: string;
}>();
</script>

<template>
  <div>
    <h2>Confirmation of Assistance Request</h2>
    <Message
      class="border-none"
      severity="success"
      :closable="false"
    >
      Your assistance request has been successfully submitted.
    </Message>
    <h3 class="inline-block mr-2">Confirmation ID:</h3>
    <router-link
      :to="{
        name: RouteName.HOUSING_ENQUIRY_INTAKE,
        query: { activityId: assignedActivityId, enquiryId: assignedEnquiryId }
      }"
    >
      <span class="text-2xl">{{ assignedActivityId }}</span>
    </router-link>
    <div>
      A Housing Navigator will review your submission and contact you in 2 business days. Your form has also been saved
      as draft, you can find it in
      <router-link :to="{ name: RouteName.HOUSING_SUBMISSIONS }">My drafts and previous entries.</router-link>
      Please check your email for the confirmation email and keep the confirmation ID for future reference
    </div>
    <div class="mt-4"><router-link :to="{ name: RouteName.HOUSING }">Back to Housing</router-link></div>
  </div>
</template>

<style scoped lang="scss">
.inline-block {
  display: inline-block;
}
</style>
