<script setup lang="ts">
import { onMounted, ref } from 'vue';

import SubmissionIntakeForm from '@/components/housing/submission/SubmissionIntakeForm.vue';

import type { Ref } from 'vue';

// Props
type Props = {
  activityId?: string;
  submissionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  submissionId: undefined
});

// State
const loading: Ref<boolean> = ref(true);

// Actions
onMounted(async () => {
  loading.value = false;
});
</script>

<template>
  <SubmissionIntakeForm
    v-if="!loading"
    :activity-id="props.activityId"
    :submission-id="props.submissionId"
  />
</template>
