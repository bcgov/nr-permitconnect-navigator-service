<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, provide, ref } from 'vue';
import { useRoute } from 'vue-router';

import EnquiryIntakeForm from '@/components/projectCommon/enquiry/EnquiryIntakeForm.vue';
import { permitService, housingProjectService } from '@/services';
import { useProjectStore, usePermitStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import {
  enquiryConfirmRouteNameKey,
  enquiryPermitConfirmRouteNameKey,
  enquiryProjectConfirmRouteNameKey,
  enquiryRouteNameKey,
  projectServiceKey
} from '@/utils/keys';

import type { Ref } from 'vue';

// Props
const { enquiryId, projectId, permitId } = defineProps<{
  enquiryId?: string;
  projectId?: string;
  permitId?: string;
}>();

// Composables
const route = useRoute();

// Store
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const { getPermit } = storeToRefs(permitStore);
const { getProject } = storeToRefs(projectStore);

// State
const loading: Ref<boolean> = ref(true);

// Providers
provide(enquiryConfirmRouteNameKey, RouteName.EXT_HOUSING_ENQUIRY_CONFIRMATION);
provide(enquiryPermitConfirmRouteNameKey, RouteName.EXT_HOUSING_PROJECT_PERMIT_ENQUIRY_CONFIRMATION);
provide(enquiryProjectConfirmRouteNameKey, RouteName.EXT_HOUSING_PROJECT_ENQUIRY_CONFIRMATION);
provide(enquiryRouteNameKey, RouteName.EXT_HOUSING_ENQUIRY_INTAKE);
provide(projectServiceKey, housingProjectService);

// Actions
onBeforeMount(async () => {
  if (projectId) {
    const project = (await housingProjectService.getProject(projectId)).data;
    projectStore.setProject(project);
  }

  if (permitId) {
    const permit = (await permitService.getPermit(permitId)).data;
    permitStore.setPermit(permit);
  }

  loading.value = false;
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
