<script setup lang="ts">
import { onBeforeMount, provide, ref } from 'vue';

import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import { enquiryService, housingProjectService, noteService, permitService } from '@/services';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Resource, RouteName } from '@/utils/enums/application';
import { BringForwardType, IntakeStatus } from '@/utils/enums/projectCommon';
import { projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { BringForward, Enquiry, HousingProject, Permit, Statistics } from '@/types';

// Store
const authzStore = useAuthZStore();

// State
const bringForward: Ref<Array<BringForward>> = ref([]);
const enquiries: Ref<Array<Enquiry>> = ref([]);
const loading: Ref<boolean> = ref(true);
const permits: Ref<Array<Permit>> = ref([]);
const projects: Ref<Array<HousingProject>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

provide(resourceKey, Resource.HOUSING_PROJECT);
provide(projectRouteNameKey, RouteName.INT_HOUSING_PROJECT);
provide(projectServiceKey, housingProjectService);

// Actions
onBeforeMount(async () => {
  [enquiries.value, permits.value, projects.value, statistics.value, bringForward.value] = (
    await Promise.all([
      enquiryService.searchEnquiries(),
      permitService.listPermits(),
      housingProjectService.searchProjects({
        includeUser: true,
        intakeStatus: [IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED, IntakeStatus.SUBMITTED]
      }),
      housingProjectService.getStatistics(),
      noteService.listBringForward(BringForwardType.UNRESOLVED)
    ])
  ).map((r) => r.data);
});

loading.value = false;
</script>

<template>
  <div class="flex justify-between">
    <h1>Housing</h1>
    <img
      class="banner-img"
      src="@/assets/images/housing_banner.png"
      alt="Housing image"
    />
  </div>
  <SubmissionsNavigator
    v-if="authzStore.canNavigate(NavigationPermission.INT_HOUSING) && !loading"
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
