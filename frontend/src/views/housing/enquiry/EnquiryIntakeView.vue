<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';

import type { ComputedRef, Ref } from 'vue';

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
const key: ComputedRef<string> = computed(() => JSON.stringify(props));
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
    :activity-id="props.activityId"
    :confirmation-id="props.confirmationId"
    :enquiry-id="props.enquiryId"
  />
</template>
