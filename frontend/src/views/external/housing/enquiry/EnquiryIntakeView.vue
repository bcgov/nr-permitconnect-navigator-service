<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';
import { permitService, submissionService } from '@/services';
import { usePermitStore, useSubmissionStore } from '@/store';

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
  submissionId
} = defineProps<{
  activityId?: string;
  confirmationId?: string;
  enquiryId?: string;
  submissionId?: string;
  projectName?: string;
  projectActivityId?: string;
  permitName?: string;
  permitTrackingId?: string;
  permitAuthStatus?: string;
}>();

// Store
const permitStore = usePermitStore();
const submissionStore = useSubmissionStore();
const { getPermit } = storeToRefs(permitStore);
const { getSubmission } = storeToRefs(submissionStore);

// State
const loading: Ref<boolean> = ref(true);

// Actions
onBeforeMount(async () => {
  loading.value = false;
});
</script>

<template>
  <!-- 'key' prop remounts component when it changes -->
  <EnquiryIntakeForm
    v-if="!loading"
    :activity-id="activityId"
    :enquiry-id="enquiryId"
    :submission-id="submissionId"
    :project-name="projectName"
    :project-activity-id="projectActivityId"
    :permit-name="permitName"
    :permit-auth-status="permitAuthStatus"
    :permit-tracking-id="permitTrackingId"
  />
</template>
