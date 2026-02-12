<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import { default as ElectrificationProjectIntakeForm } from '@/components/electrification/project/ProjectIntakeForm.vue';
import { default as HousingProjectIntakeForm } from '@/components/housing/project/ProjectIntakeForm.vue';
import { permitService } from '@/services';
import { useAppStore, usePermitStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { Ref } from 'vue';
import { generalErrorHandler } from '@/utils/utils';

// Props
const { draftId = undefined, projectId = undefined } = defineProps<{
  draftId?: string;
  projectId?: string;
}>();

// Composables
const route = useRoute();

// Store
const { getInitiative } = storeToRefs(useAppStore());

// State
const loading: Ref<boolean> = ref(true);

// Actions
onBeforeMount(async () => {
  try {
    usePermitStore().setPermitTypes((await permitService.getPermitTypes(getInitiative.value)).data);
    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div v-if="!loading">
    <ElectrificationProjectIntakeForm
      v-if="getInitiative === Initiative.ELECTRIFICATION"
      :key="route.fullPath"
      :draft-id="draftId"
      :electrification-project-id="projectId"
    />
    <HousingProjectIntakeForm
      v-if="getInitiative === Initiative.HOUSING"
      :key="route.fullPath"
      :draft-id="draftId"
      :housing-project-id="projectId"
    />
  </div>
</template>
