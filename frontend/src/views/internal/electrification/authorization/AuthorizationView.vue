<script setup lang="ts">
import { provide } from 'vue';

import AuthorizationForm from '@/components/form/common/AuthorizationForm.vue';
import { electrificationProjectService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { projectViewRouteNameKey, projectServiceKey } from '@/utils/keys';

const {
  editable = true,
  activityId,
  projectId
} = defineProps<{
  editable?: boolean;
  activityId: string;
  projectId: string;
}>();

// Providers
provide(projectViewRouteNameKey, RouteName.INT_ELECTRIFICATION_PROJECT);
provide(projectServiceKey, electrificationProjectService);
</script>

<template>
  <AuthorizationForm
    :editable="editable"
    :activity-id="activityId"
    :project-id="projectId"
  />
</template>
