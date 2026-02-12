<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import EnquiryIntakeForm from '@/components/enquiry/EnquiryIntakeForm.vue';
import { permitService, housingProjectService, electrificationProjectService } from '@/services';
import { useProjectStore, usePermitStore, useAppStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import {
  enquiryConfirmRouteNameKey,
  enquiryPermitConfirmRouteNameKey,
  enquiryProjectConfirmRouteNameKey,
  enquiryRouteNameKey,
  projectServiceKey
} from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IProjectService } from '@/interfaces/IProjectService';

// Props
const {
  enquiryId = undefined,
  projectId = undefined,
  permitId = undefined
} = defineProps<{
  enquiryId?: string;
  projectId?: string;
  permitId?: string;
}>();

// Interfaces
interface InitiativeState {
  enquiryConfirmRouteName?: RouteName;
  enquiryIntakeRouteName?: RouteName;
  enquiryPermitConfirmRouteName: RouteName;
  enquiryProjectConfirmRouteName: RouteName;
  projectService: IProjectService;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  enquiryPermitConfirmRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT_ENQUIRY_CONFIRMATION,
  enquiryProjectConfirmRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT_ENQUIRY_CONFIRMATION,
  projectService: electrificationProjectService
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  enquiryConfirmRouteName: RouteName.EXT_HOUSING_ENQUIRY_CONFIRMATION,
  enquiryIntakeRouteName: RouteName.EXT_HOUSING_ENQUIRY_INTAKE,
  enquiryPermitConfirmRouteName: RouteName.EXT_HOUSING_PROJECT_PERMIT_ENQUIRY_CONFIRMATION,
  enquiryProjectConfirmRouteName: RouteName.EXT_HOUSING_PROJECT_ENQUIRY_CONFIRMATION,
  projectService: housingProjectService
};

// Composables
const { t } = useI18n();
const route = useRoute();

// Store
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const { getInitiative } = storeToRefs(useAppStore());
const { getPermit } = storeToRefs(permitStore);
const { getProject } = storeToRefs(projectStore);

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);
const loading: Ref<boolean> = ref(true);

// Providers
const provideEnquiryConfirmRouteName = computed(() => initiativeState.value.enquiryConfirmRouteName);
const provideEnquiryPermitConfirmRouteName = computed(() => initiativeState.value.enquiryPermitConfirmRouteName);
const provideEnquiryProjectConfirmRouteName = computed(() => initiativeState.value.enquiryProjectConfirmRouteName);
const provideEnquiryIntakeRouteName = computed(() => initiativeState.value.enquiryIntakeRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
provide(enquiryConfirmRouteNameKey, provideEnquiryConfirmRouteName);
provide(enquiryPermitConfirmRouteNameKey, provideEnquiryPermitConfirmRouteName);
provide(enquiryProjectConfirmRouteNameKey, provideEnquiryProjectConfirmRouteName);
provide(enquiryRouteNameKey, provideEnquiryIntakeRouteName);
provide(projectServiceKey, provideProjectService);

// Actions
onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    if (projectId) {
      const project = (await provideProjectService.value.getProject(projectId)).data;
      projectStore.setProject(project);
    }

    if (permitId) {
      const permit = (await permitService.getPermit(permitId)).data;
      permitStore.setPermit(permit);
    }

    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <EnquiryIntakeForm
    v-if="!loading"
    :key="route.fullPath"
    :enquiry-id="enquiryId"
    :project="getProject"
    :permit="getPermit"
  />
</template>
