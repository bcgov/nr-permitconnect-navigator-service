<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import SubmissionIntakeForm from '@/components/housing/submission/SubmissionIntakeForm.vue';
import { permitService } from '@/services';
import { usePermitStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Props
const { submissionId = undefined, draftId = undefined } = defineProps<{
  submissionId?: string;
  draftId?: string;
}>();

// Composables
const route = useRoute();

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
    :key="route.fullPath"
    :submission-id="housingProjectId"
    :draft-id="draftId"
  />
</template>
