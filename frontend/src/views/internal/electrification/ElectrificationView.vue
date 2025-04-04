<script setup lang="ts">
import { onBeforeMount, provide, ref } from 'vue';

import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import { electrificationProjectService, enquiryService, noteService, permitService } from '@/services';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';

import { BringForwardType, IntakeStatus } from '@/utils/enums/housing';

import type { Ref } from 'vue';
import type { BringForward, ElectrificationProject, Enquiry, Permit, Statistics } from '@/types';
import { Resource, RouteName } from '@/utils/enums/application';

// Store
const authzStore = useAuthZStore();

// State
const bringForward: Ref<Array<BringForward>> = ref([]);
const enquiries: Ref<Array<Enquiry>> = ref([]);
const loading: Ref<boolean> = ref(true);
const permits: Ref<Array<Permit>> = ref([]);
const projects: Ref<Array<ElectrificationProject>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

//provide('projectService', electrificationProjectService);
provide('projectResource', Resource.ELECTRIFICATION_PROJECT);
provide('projectRoute', RouteName.INT_ELECTRIFICATION_PROJECT);

// Actions
onBeforeMount(async () => {
  [enquiries.value, permits.value, projects.value, statistics.value, bringForward.value] = (
    await Promise.all([
      enquiryService.getEnquiries(), // TODO: Get enquiries for correct initiative
      permitService.listPermits(),
      electrificationProjectService.searchProjects({
        includeUser: true,
        intakeStatus: [IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED, IntakeStatus.SUBMITTED]
      }),
      electrificationProjectService.getStatistics(),
      noteService.listBringForward(BringForwardType.UNRESOLVED)
    ])
  ).map((r) => r.data);
});

loading.value = false;
</script>

<template>
  <h1>Submissions</h1>
  <SubmissionsNavigator
    v-if="authzStore.canNavigate(NavigationPermission.INT_ELECTRIFICATION) && !loading"
    v-model:bring-forward="bringForward"
    v-model:enquiries="enquiries"
    v-model:permits="permits"
    v-model:projects="projects"
    v-model:statistics="statistics"
  />
</template>
