<script setup lang="ts">
import { onBeforeMount, provide, ref } from 'vue';

import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import { electrificationProjectService, enquiryService, noteService, permitService } from '@/services';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Resource, RouteName } from '@/utils/enums/application';
import { BringForwardType, IntakeStatus } from '@/utils/enums/projectCommon';
import { projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { BringForward, ElectrificationProject, Enquiry, Permit, Statistics } from '@/types';

// Store
const authzStore = useAuthZStore();

// State
const bringForward: Ref<Array<BringForward>> = ref([]);
const enquiries: Ref<Array<Enquiry>> = ref([]);
const loading: Ref<boolean> = ref(true);
const permits: Ref<Array<Permit>> = ref([]);
const projects: Ref<Array<ElectrificationProject>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

provide(resourceKey, Resource.ELECTRIFICATION_PROJECT);
provide(projectRouteNameKey, RouteName.INT_ELECTRIFICATION_PROJECT);
provide(projectServiceKey, electrificationProjectService);

// Actions
onBeforeMount(async () => {
  [enquiries.value, permits.value, projects.value, statistics.value, bringForward.value] = (
    await Promise.all([
      enquiryService.searchEnquiries(),
      permitService.listPermits(),
      electrificationProjectService.searchProjects({
        includeUser: true,
        intakeStatus: [IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED, IntakeStatus.SUBMITTED]
      }),
      electrificationProjectService.getStatistics(),
      noteService.listBringForward(BringForwardType.UNRESOLVED)
    ])
  ).map((r) => r.data);

  loading.value = false;
});
</script>

<template>
  <div class="flex justify-between">
    <h1>Electrification</h1>
    <img
      class="banner-img"
      src="@/assets/images/elec_banner.png"
      alt="Electrification image"
    />
  </div>
  <SubmissionsNavigator
    v-if="authzStore.canNavigate(NavigationPermission.INT_ELECTRIFICATION) && !loading"
    v-model:bring-forward="bringForward"
    v-model:enquiries="enquiries"
    v-model:permits="permits"
    v-model:projects="projects"
    v-model:statistics="statistics"
  />
</template>

<style lang="scss" scoped>
.banner-img {
  max-height: 105px;
  max-width: 137px;
  width: auto;
  height: auto;
}
</style>
