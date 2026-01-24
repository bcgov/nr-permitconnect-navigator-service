<script setup lang="ts">
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ViewHeader from '@/components/common/ViewHeader.vue';
import { Spinner } from '@/components/layout';
import SubmissionsNavigator from '@/components/submission/SubmissionsNavigator.vue';
import {
  enquiryService,
  electrificationProjectService,
  housingProjectService,
  noteHistoryService,
  permitService
} from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, Resource, RouteName } from '@/utils/enums/application';
import { BringForwardType } from '@/utils/enums/projectCommon';
import { enquiryRouteNameKey, projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { BringForward, Enquiry, HousingProject, Permit, Statistics } from '@/types';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';

// Interfaces
interface ViewState {
  headerText: string;
  navigationPermission: NavigationPermission;
  provideEnquiryRouteName: RouteName;
  provideProjectRouteName: RouteName;
  provideProjectService: IDraftableProjectService;
  provideResource: Resource;
}

// Composables
const { t } = useI18n();
const authzStore = useAuthZStore();

// Constants
const ELECTRIFICATION_VIEW_STATE: ViewState = {
  headerText: t('i.electrification.electrificationView.header'),
  navigationPermission: NavigationPermission.INT_ELECTRIFICATION,
  provideEnquiryRouteName: RouteName.INT_ELECTRIFICATION_ENQUIRY,
  provideProjectRouteName: RouteName.INT_ELECTRIFICATION_PROJECT,
  provideProjectService: electrificationProjectService,
  provideResource: Resource.ELECTRIFICATION_PROJECT
};

const HOUSING_VIEW_STATE: ViewState = {
  headerText: t('i.housing.housingView.header'),
  navigationPermission: NavigationPermission.INT_HOUSING,
  provideEnquiryRouteName: RouteName.INT_HOUSING_ENQUIRY,
  provideProjectRouteName: RouteName.INT_HOUSING_PROJECT,
  provideProjectService: housingProjectService,
  provideResource: Resource.HOUSING_PROJECT
};

// State
const bringForward: Ref<BringForward[]> = ref([]);
const enquiries: Ref<Enquiry[]> = ref([]);
const loading: Ref<boolean> = ref(true);
const permits: Ref<Permit[]> = ref([]);
const projects: Ref<HousingProject[]> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);
const viewState: Ref<ViewState> = ref(HOUSING_VIEW_STATE);

// Providers
const provideEnquiryRouteName = computed(() => viewState.value.provideEnquiryRouteName);
const provideProjectRouteName = computed(() => viewState.value.provideProjectRouteName);
const provideProjectService = computed(() => viewState.value.provideProjectService);
const provideResource = computed(() => viewState.value.provideResource);
provide(enquiryRouteNameKey, provideEnquiryRouteName);
provide(projectRouteNameKey, provideProjectRouteName);
provide(projectServiceKey, provideProjectService);
provide(resourceKey, provideResource);

// Actions
onBeforeMount(async () => {
  try {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        viewState.value = ELECTRIFICATION_VIEW_STATE;
        break;
      case Initiative.HOUSING:
        viewState.value = HOUSING_VIEW_STATE;
        break;
      default:
        throw new Error('Unable to determine view state');
    }

    [enquiries.value, permits.value, projects.value, statistics.value, bringForward.value] = (
      await Promise.all([
        enquiryService.searchEnquiries(),
        permitService.listPermits(),
        viewState.value.provideProjectService.searchProjects({
          includeUser: true
        }),
        viewState.value.provideProjectService.getStatistics(),
        noteHistoryService.listBringForward(BringForwardType.UNRESOLVED)
      ])
    ).map((r) => r.data);
    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div v-if="loading">
    <Spinner />
  </div>
  <div v-else>
    <ViewHeader :header="viewState.headerText" />
    <SubmissionsNavigator
      v-if="authzStore.canNavigate(viewState?.navigationPermission)"
      v-model:bring-forward="bringForward"
      v-model:enquiries="enquiries"
      v-model:permits="permits"
      v-model:projects="projects"
      v-model:statistics="statistics"
    />
  </div>
</template>
