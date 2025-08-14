<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationForm from '@/components/authorization/AuthorizationForm.vue';
import { useToast } from '@/lib/primevue';
import { housingProjectService, permitService } from '@/services';
import { usePermitStore, useProjectStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';

import type { Ref } from 'vue';

const { projectId, permitId } = defineProps<{
  projectId: string;
  permitId?: string;
}>();

// State
const activityId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(true);

// Composables
const { t } = useI18n();
const toast = useToast();
const permitStore = usePermitStore();
const projectStore = useProjectStore();

// Store
const { getPermit } = storeToRefs(permitStore);
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
    if (!permitId) {
      permitStore.reset();
    } else {
      const permit = (await permitService.getPermit(permitId)).data;
      permitStore.setPermit(permit);
    }
    loading.value = false;
  } catch {
    toast.error(t('i.housing.authorization.authorizationView.projectPermitLoadError'));
  }
});
</script>

<template>
  <div v-if="!loading">
    <AuthorizationForm
      :authorization="getPermit"
      :editable="getProject?.applicationStatus !== ApplicationStatus.COMPLETED"
    />
  </div>
</template>
