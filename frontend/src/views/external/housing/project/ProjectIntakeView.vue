<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import SubmissionIntakeForm from '@/components/housing/submission/SubmissionIntakeForm.vue';
import { permitService } from '@/services';
import { usePermitStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Props
const { draftId = undefined, projectId = undefined } = defineProps<{
  draftId?: string;
  projectId?: string;
}>();

// Composables
const route = useRoute();

// State
const loading: Ref<boolean> = ref(true);

// Actions
onBeforeMount(async () => {
  usePermitStore().setPermitTypes((await permitService.getPermitTypes(Initiative.HOUSING)).data);
  loading.value = false;
});
</script>

<template>
  <SubmissionIntakeForm
    v-if="!loading"
    :key="route.fullPath"
    :housing-project-id="projectId"
    :draft-id="draftId"
  />
</template>
