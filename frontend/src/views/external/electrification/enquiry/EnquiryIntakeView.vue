<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import EnquiryIntakeForm from '@/components/housing/enquiry/EnquiryIntakeForm.vue';
import { permitService, housingProjectService } from '@/services';
import { useHousingProjectStore, usePermitStore } from '@/store';

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
const housingProjectStore = useHousingProjectStore();
const { getPermit } = storeToRefs(permitStore);
const { getHousingProject } = storeToRefs(housingProjectStore);

// State
const loading: Ref<boolean> = ref(true);

// Actions
onBeforeMount(async () => {
  if (housingProjectId) {
    const project = (await housingProjectService.getHousingProject(housingProjectId)).data;
    housingProjectStore.setHousingProject(project);
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
    :project="getHousingProject"
    :permit="getPermit"
  />
</template>
