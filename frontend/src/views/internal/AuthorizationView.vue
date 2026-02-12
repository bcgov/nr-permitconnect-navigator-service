<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationForm from '@/components/authorization/AuthorizationForm.vue';
import { electrificationProjectService, housingProjectService, permitService } from '@/services';
import { useAppStore, usePermitStore, useProjectStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';

// Props
const { projectId, permitId = undefined } = defineProps<{
  projectId: string;
  permitId?: string;
}>();

// Interfaces
interface InitiativeState {
  projectRouteName: RouteName;
  projectService: IDraftableProjectService;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  projectRouteName: RouteName.INT_ELECTRIFICATION_PROJECT,
  projectService: electrificationProjectService
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  projectRouteName: RouteName.INT_HOUSING_PROJECT,
  projectService: housingProjectService
};

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);
const loading: Ref<boolean> = ref(true);

// Composables
const { t } = useI18n();
const permitStore = usePermitStore();
const projectStore = useProjectStore();

// Store
const { getPermit } = storeToRefs(permitStore);
const { getProject } = storeToRefs(projectStore);

// Providers
const provideProjectRouteName = computed(() => initiativeState.value.projectRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
provide(projectRouteNameKey, provideProjectRouteName);
provide(projectServiceKey, provideProjectService);

onBeforeMount(async () => {
  try {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    if (!getProject.value) {
      const project = (await initiativeState.value.projectService.getProject(projectId)).data;
      projectStore.setProject(project);
    }

    if (!permitId) {
      permitStore.reset();
    } else {
      const permit = (await permitService.getPermit(permitId)).data;
      permitStore.setPermit(permit);
    }
    loading.value = false;
  } catch (e) {
    generalErrorHandler(e, t('views.i.authorizationView.projectPermitLoadError'));
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
