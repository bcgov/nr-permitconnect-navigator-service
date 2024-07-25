<script setup lang="ts">
import { onMounted, ref } from 'vue';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';

import type { Ref } from 'vue';

// Props
type Props = {
  activityId?: string;
  confirmationId?: string;
  enquiryId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  confirmationId: undefined,
  enquiryId: undefined
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
    :confirmation-id="props.confirmationId"
    :enquiry-id="props.enquiryId"
  />
</template>
