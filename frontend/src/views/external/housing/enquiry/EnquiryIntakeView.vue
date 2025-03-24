<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';
import { permitService, submissionService } from '@/services';
import { usePermitStore, useSubmissionStore } from '@/store';

import type { Ref } from 'vue';

// Props
const { enquiryId, permitId, submissionId } = defineProps<{
  enquiryId?: string;
  permitId?: string;
  submissionId?: string;
}>();

// Composables
const route = useRoute();

// Store
const permitStore = usePermitStore();
const submissionStore = useSubmissionStore();
const { getPermit } = storeToRefs(permitStore);
const { getSubmission } = storeToRefs(submissionStore);

// State
const loading: Ref<boolean> = ref(true);

// Actions
onBeforeMount(async () => {
  if (submissionId) {
    const project = (await submissionService.getSubmission(submissionId)).data;
    submissionStore.setSubmission(project);
  }

  if (permitId) {
    const permit = (await permitService.getPermit(permitId)).data;
    permitStore.setPermit(permit);
  }

  loading.value = false;
});
</script>

<template>
  <EnquiryIntakeForm
    v-if="!loading"
    :key="route.fullPath"
    :enquiry-id="enquiryId"
    :project="getSubmission"
    :permit="getPermit"
  />
</template>
