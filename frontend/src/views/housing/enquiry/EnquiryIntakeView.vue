<script setup lang="ts">
import { onMounted, ref } from 'vue';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';

import type { Ref } from 'vue';

// Props
type Props = {
  activityId?: string;
  enquiryId?: string;
  assignedActivityId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  enquiryId: undefined,
  assignedActivityId: undefined
});

// State
const loading: Ref<boolean> = ref(true);

// Actions
onMounted(async () => {
  loading.value = false;
});
</script>

<template>
  <EnquiryIntakeForm
    v-if="!loading"
    :activity-id="props.activityId"
    :enquiry-id="props.enquiryId"
    :assigned-activity-id="props.assignedActivityId"
  />
</template>
