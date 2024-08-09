<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import SubmissionIntakeForm from '@/components/housing/submission/SubmissionIntakeForm.vue';
import { permitService } from '@/services';
import { useTypeStore } from '@/store';

import type { ComputedRef, Ref } from 'vue';

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
const key: ComputedRef<string> = computed(() => JSON.stringify(props));
const loading: Ref<boolean> = ref(true);

// Actions
onMounted(async () => {
  useTypeStore().setPermitTypes((await permitService.getPermitTypes()).data);
  loading.value = false;
});
</script>

<template>
  <!-- 'key' prop remounts component when it changes -->
  <SubmissionIntakeForm
    v-if="!loading"
    :key="key"
    :activity-id="props.activityId"
    :submission-id="props.submissionId"
  />
</template>
