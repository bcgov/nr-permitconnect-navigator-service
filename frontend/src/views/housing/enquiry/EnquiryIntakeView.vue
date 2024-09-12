<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';

import type { ComputedRef, Ref } from 'vue';

// Props
const {
  activityId = undefined,
  enquiryId = undefined,
  submissionId = undefined
} = defineProps<{
  activityId?: string;
  confirmationId?: string;
  enquiryId?: string;
  submissionId?: string;
}>();

// State
const key: ComputedRef<string> = computed(() => JSON.stringify({ activityId, enquiryId, submissionId }));
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
    :key="key"
    :activity-id="activityId"
    :enquiry-id="enquiryId"
    :submission-id="submissionId"
  />
</template>
