<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import EnquiryIntakeForm from '@/components/projectCommon/enquiry/EnquiryIntakeForm.vue';
import { permitService, housingProjectService } from '@/services';
import { useProjectStore, usePermitStore } from '@/store';

import type { Ref } from 'vue';

// Props
const { enquiryId, housingProjectId, permitId } = defineProps<{
  enquiryId?: string;
  housingProjectId?: string;
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

// Actions
onBeforeMount(async () => {
  if (housingProjectId) {
    const project = (await housingProjectService.getProject(housingProjectId)).data;
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
