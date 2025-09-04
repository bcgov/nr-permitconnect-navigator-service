<script setup lang="ts">
import { onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ViewHeader from '@/components/common/ViewHeader.vue';
import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import { electrificationProjectService, enquiryService, noteHistoryService, permitService } from '@/services';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Resource, RouteName } from '@/utils/enums/application';
import { BringForwardType, IntakeStatus } from '@/utils/enums/projectCommon';
import {
  enquiryNoteRouteNameKey,
  enquiryRouteNameKey,
  projectRouteNameKey,
  projectServiceKey,
  resourceKey
} from '@/utils/keys';

import type { Ref } from 'vue';
import type { BringForward, ElectrificationProject, Enquiry, Permit, Statistics } from '@/types';

// Composables
const { t } = useI18n();

// Store
const authzStore = useAuthZStore();

// State
const bringForward: Ref<Array<BringForward>> = ref([]);
const enquiries: Ref<Array<Enquiry>> = ref([]);
const loading: Ref<boolean> = ref(true);
const permits: Ref<Array<Permit>> = ref([]);
const projects: Ref<Array<ElectrificationProject>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

// Providers
provide(enquiryNoteRouteNameKey, RouteName.INT_ELECTRIFICATION_ENQUIRY_NOTE);
provide(enquiryRouteNameKey, RouteName.INT_ELECTRIFICATION_ENQUIRY);
provide(projectRouteNameKey, RouteName.INT_ELECTRIFICATION_PROJECT);
provide(projectServiceKey, electrificationProjectService);
provide(resourceKey, Resource.ELECTRIFICATION_PROJECT);

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
      noteHistoryService.listBringForward(BringForwardType.UNRESOLVED)
    ])
  ).map((r) => r.data);

  loading.value = false;
});
</script>

<template>
  <ViewHeader :header="t('i.electrification.electrificationView.header')" />
  <SubmissionsNavigator
    v-if="authzStore.canNavigate(NavigationPermission.INT_ELECTRIFICATION) && !loading"
    v-model:bring-forward="bringForward"
    v-model:enquiries="enquiries"
    v-model:permits="permits"
    v-model:projects="projects"
    v-model:statistics="statistics"
  />
</template>
