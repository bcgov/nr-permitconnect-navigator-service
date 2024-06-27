<script setup lang="ts">
import { Message } from '@/lib/primevue';

import { RouteName } from '@/utils/enums/application';

// Props
type Props = {
  assignedActivityId: string;
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div>
    <h2>Confirmation of Submission</h2>
    <Message
      class="border-none"
      severity="success"
      :closable="false"
    >
      Your enquiry has been successfully submitted.
    </Message>
    <h3>Confirmation ID: {{ props.assignedActivityId }}</h3>
    <div>
      A Housing Navigator will review your submission and contact you. Please check your email for the confirmation
      email and keep the confirmation ID for future reference.
    </div>
    <div class="mt-4"><router-link :to="{ name: RouteName.HOME }">Go to Homepage</router-link></div>
  </div>
</template>
