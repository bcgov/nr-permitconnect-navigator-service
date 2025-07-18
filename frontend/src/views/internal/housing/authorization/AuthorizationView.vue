<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationForm from '@/components/authorization/AuthorizationForm.vue';
import { useToast } from '@/lib/primevue';
import { housingProjectService } from '@/services';
import { useProjectStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';

import type { Ref } from 'vue';

const {
  editable = true,
  projectId,
  permitId
} = defineProps<{
  editable?: boolean;
  projectId: string;
  permitId?: string;
}>();

// State
const activityId: Ref<string> = ref('');

// Composables
const { t } = useI18n();
const toast = useToast();
const projectStore = useProjectStore();

// Store
const { getProject } = storeToRefs(projectStore);

// Providers
provide(projectRouteNameKey, RouteName.INT_HOUSING_PROJECT);
provide(projectServiceKey, housingProjectService);

onBeforeMount(async () => {
  try {
    if (!getProject.value) {
      const project = (await housingProjectService.getProject(projectId)).data;
      projectStore.setProject(project);
    }
    if (getProject.value?.activityId) {
      activityId.value = getProject.value.activityId;
    }
  } catch {
    toast.error(t('i.housing.authorization.authorizationView.projectPermitLoadError'));
  }
});
</script>

<template>
  <AuthorizationForm
    :editable="editable"
    :project-id="projectId"
    :activity-id="activityId"
    :authorization-id="permitId"
  />
</template>
