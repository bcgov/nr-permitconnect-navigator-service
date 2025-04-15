<script setup lang="ts">
import { useRoute } from 'vue-router';

import ProjectIntakeForm from '@/components/electrification/project/ProjectIntakeForm.vue';

// Props
const { draftId = undefined, projectId = undefined } = defineProps<{
  draftId?: string;
  projectId?: string;
}>();

// Composables
const route = useRoute();
</script>
<template>
  <ProjectIntakeForm
    :key="route.fullPath"
    :draft-id="draftId"
    :electrification-project-id="projectId"
  />
</template>
