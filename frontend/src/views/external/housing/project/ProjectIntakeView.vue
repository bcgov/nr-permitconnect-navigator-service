<script setup lang="ts">
import { onMounted, ref } from 'vue';

import SubmissionIntakeForm from '@/components/housing/submission/SubmissionIntakeForm.vue';
import { permitService } from '@/services';
import { useTypeStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Props
const { activityId = undefined, housingProjectId = undefined } = defineProps<{
  activityId?: string;
  housingProjectId?: string;
}>();

// State
const loading: Ref<boolean> = ref(true);

// Actions
onMounted(async () => {
  useTypeStore().setPermitTypes((await permitService.getPermitTypes(Initiative.HOUSING)).data);
  loading.value = false;
});
</script>

<template>
  <!-- 'key' prop remounts component when it changes -->
  <SubmissionIntakeForm
    v-if="!loading"
    :activity-id="activityId"
    :submission-id="housingProjectId"
  />
</template>
