<script setup lang="ts">
import { onMounted, ref } from 'vue';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';

import type { Ref } from 'vue';

// Props
const {
  activityId,
  enquiryId,
  projectName,
  projectActivityId,
  permitName,
  permitTrackingId,
  permitAuthStatus,
  housingProjectId
} = defineProps<{
  activityId?: string;
  confirmationId?: string;
  enquiryId?: string;
  housingProjectId?: string;
  projectName?: string;
  projectActivityId?: string;
  permitName?: string;
  permitTrackingId?: string;
  permitAuthStatus?: string;
}>();

// State
const loading: Ref<boolean> = ref(true);

// Actions
onMounted(async () => {
  loading.value = false;
});
</script>

<template>
  <!-- 'key' prop remounts component when it changes -->
  <EnquiryIntakeForm
    v-if="!loading"
    :activity-id="activityId"
    :enquiry-id="enquiryId"
    :submission-id="housingProjectId"
    :project-name="projectName"
    :project-activity-id="projectActivityId"
    :permit-name="permitName"
    :permit-auth-status="permitAuthStatus"
    :permit-tracking-id="permitTrackingId"
  />
</template>
