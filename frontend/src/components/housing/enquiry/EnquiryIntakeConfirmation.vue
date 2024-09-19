<script setup lang="ts">
import { Message } from '@/lib/primevue';

import { RouteName } from '@/utils/enums/application';

// Props
const {
  assignedActivityId,
  showHeader = true,
  showHomeLink = true
} = defineProps<{
  assignedActivityId: string;
  showHeader?: boolean;
  showHomeLink?: boolean;
}>();
</script>

<template>
  <div>
    <h2 v-if="showHeader">Confirmation of Submission</h2>
    <Message
      class="border-none"
      severity="success"
      :closable="false"
    >
      Your enquiry has been successfully submitted.
    </Message>
    <h3>Confirmation ID: {{ assignedActivityId }}</h3>
    <div>
      A Housing Navigator will review your submission and contact you. Please check your email for the confirmation
      email and keep the confirmation ID for future reference.
    </div>
    <div
      v-if="showHomeLink"
      class="mt-4"
    >
      <router-link :to="{ name: RouteName.HOUSING }">Back to Housing</router-link>
    </div>
  </div>
</template>
