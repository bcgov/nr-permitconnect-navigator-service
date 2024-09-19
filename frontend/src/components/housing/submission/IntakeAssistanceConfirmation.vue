<script setup lang="ts">
import { Message } from '@/lib/primevue';

import { RouteName } from '@/utils/enums/application';

// Props
const { assignedActivityId } = defineProps<{
  assignedActivityId: string;
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
    <h3>Confirmation ID: {{ assignedActivityId }}</h3>
    <div>
      A Housing Navigator will review your submission and contact you. Your form has also been saved as draft, you can
      find it in
      <router-link :to="{ name: RouteName.HOUSING_SUBMISSIONS }">My drafts and previous entries.</router-link>
      Please check your email for the confirmation email and keep the confirmation ID for future reference
    </div>
    <div class="mt-4"><router-link :to="{ name: RouteName.HOUSING }">Back to Housing</router-link></div>
  </div>
</template>
