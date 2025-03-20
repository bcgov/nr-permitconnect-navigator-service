<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import SubmissionIntakeForm from '@/components/housing/submission/SubmissionIntakeForm.vue';
import { permitService } from '@/services';
import { usePermitStore } from '@/store';

import type { Ref } from 'vue';

// Props
const { activityId = undefined, submissionId = undefined } = defineProps<{
  activityId?: string;
  submissionId?: string;
}>();

// State
const loading: Ref<boolean> = ref(true);

// Actions
onBeforeMount(async () => {
  usePermitStore().setPermitTypes((await permitService.getPermitTypes()).data);
  loading.value = false;
});
</script>

<template>
  <SubmissionIntakeForm
    v-if="!loading"
    :activity-id="activityId"
    :submission-id="submissionId"
  />
</template>
