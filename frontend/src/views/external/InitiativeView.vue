<script setup lang="ts">
import { computed, nextTick, onBeforeMount, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import EnquiryListProponent from '@/components/enquiry/EnquiryListProponent.vue';
import ProjectDraftListProponent from '@/components/projectCommon/ProjectDraftListProponent.vue';
import { Button, Paginator } from '@/lib/primevue';
import { electrificationProjectService, enquiryService, housingProjectService, permitService } from '@/services';
import { useAppStore, useContactStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, RouteName } from '@/utils/enums/application';
import { PermitState } from '@/utils/enums/permit';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import {
  draftableProjectServiceKey,
  enquiryRouteNameKey,
  navigationPermissionKey,
  projectIntakeRouteNameKey
} from '@/utils/keys';

import type { Ref } from 'vue';
import type { Draft, Enquiry, HousingProject, Permit } from '@/types';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';
import { generalErrorHandler } from '@/utils/utils';
import { storeToRefs } from 'pinia';

// Interfaces
interface InitiativeState {
  headerText: string;
  initiativeRouteName: RouteName;
  provideDraftableProjectService: IDraftableProjectService;
  provideEnquiryRouteName?: RouteName;
  provideNavigationPermission: NavigationPermission;
  projectRouteName: RouteName;
  provideProjectIntakeRouteName: RouteName;
  enquiryIntakeRouteName?: RouteName;
}

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Constants
const ELECTRIFICATION_VIEW_STATE: InitiativeState = {
  headerText: t('e.electrification.electrificationView.electrification'),
  initiativeRouteName: RouteName.EXT_ELECTRIFICATION,
  provideDraftableProjectService: electrificationProjectService,
  provideNavigationPermission: NavigationPermission.EXT_ELECTRIFICATION,
  projectRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT,
  provideProjectIntakeRouteName: RouteName.EXT_ELECTRIFICATION_INTAKE
};

const HOUSING_VIEW_STATE: InitiativeState = {
  headerText: t('e.housing.housingView.housing'),
  initiativeRouteName: RouteName.EXT_HOUSING,
  provideNavigationPermission: NavigationPermission.EXT_HOUSING,
  provideDraftableProjectService: housingProjectService,
  provideEnquiryRouteName: RouteName.EXT_HOUSING_ENQUIRY,
  projectRouteName: RouteName.EXT_HOUSING_PROJECT,
  provideProjectIntakeRouteName: RouteName.EXT_HOUSING_INTAKE,
  enquiryIntakeRouteName: RouteName.EXT_HOUSING_ENQUIRY_INTAKE
};

const PAGE_ROWS = 5;

// Store
const { getInitiative } = storeToRefs(useAppStore());

// State
const authorizations: Ref<Permit[]> = ref([]);
const drafts: Ref<Draft[]> = ref([]);
const enquiries: Ref<Enquiry[]> = ref([]);
const first: Ref<number> = ref(0);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_VIEW_STATE);
const loading: Ref<boolean> = ref(true);
const projects: Ref<HousingProject[]> = ref([]);

// Providers
const provideDraftableProjectService = computed(() => initiativeState.value.provideDraftableProjectService);
const provideEnquiryRouteName = computed(() => initiativeState.value.provideEnquiryRouteName);
const provideNavigationPermission = computed(() => initiativeState.value.provideNavigationPermission);
const provideProjectIntakeRouteName = computed(() => initiativeState.value.provideProjectIntakeRouteName);
provide(draftableProjectServiceKey, provideDraftableProjectService);
provide(enquiryRouteNameKey, provideEnquiryRouteName);
provide(navigationPermissionKey, provideNavigationPermission);
provide(projectIntakeRouteNameKey, provideProjectIntakeRouteName);

// Actions
async function createIntake() {
  const contact = useContactStore().getContact;
  const response = await provideDraftableProjectService.value.updateDraft({
    data: {
      contacts: {
        contactId: contact?.contactId,
        userId: contact?.userId,
        contactFirstName: contact?.firstName,
        contactLastName: contact?.lastName,
        contactEmail: contact?.email,
        contactPhoneNumber: contact?.phoneNumber,
        contactApplicantRelationship: contact?.contactApplicantRelationship,
        contactPreference: contact?.contactPreference
      }
    }
  });

  router.push({
    name: provideProjectIntakeRouteName.value,
    params: {
      draftId: response.data.draftId
    }
  });
}

const displayedProjectsInOrder = computed(() => {
  // Filter projects to only include completed projects and sort them by last updated
  const completed = projects.value
    .filter((p) => p.applicationStatus === ApplicationStatus.COMPLETED)
    .sort(sortByLastUpdated);

  // Filter projects to only include active projects and sort them by last updated
  const active = projects.value
    .filter((p) => [ApplicationStatus.IN_PROGRESS, ApplicationStatus.NEW].includes(p.applicationStatus))
    .sort((a, b) => {
      if (a.submittedAt && b.submittedAt) {
        return a.submittedAt > b.submittedAt ? -1 : 1;
      } else {
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        return 0;
      }
    });

  // Combine active and completed projects, then slice based on pagination
  return [...active, ...completed].slice(first.value, first.value + PAGE_ROWS);
});

const hasPendingAuth = computed(() => (activityId: string) => {
  return authorizations.value.some(
    (auth) => auth.activityId === activityId && auth.state === PermitState.PENDING_CLIENT
  );
});

function onHousingProjectDraftDelete(draftId: string) {
  drafts.value = drafts.value.filter((x) => x.draftId !== draftId);
}

function sortByLastUpdated(a: HousingProject, b: HousingProject) {
  if (a.updatedAt && b.updatedAt) {
    return a.updatedAt > b.updatedAt ? -1 : 1;
  } else {
    if (!a.updatedAt) return 1;
    if (!b.updatedAt) return -1;
    return 0;
  }
}

watch(
  () => route.hash,
  async (newHash) => {
    if (newHash) {
      await nextTick();
      const target = document.querySelector(newHash);
      if (target && target instanceof HTMLElement) {
        target.focus();
      }
    }
  }
);

onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_VIEW_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_VIEW_STATE;
        break;
      default:
        throw new Error(t('i.common.view.initiativeStateError'));
    }

    [authorizations.value, enquiries.value, projects.value, drafts.value] = (
      await Promise.all([
        permitService.listPermits(),
        enquiryService.getEnquiries(),
        provideDraftableProjectService.value.searchProjects(),
        provideDraftableProjectService.value.getDrafts()
      ])
    ).map((r) => r.data);

    // Sort by last updated, push non-updated projects to bottom
    projects.value.sort(sortByLastUpdated);

    drafts.value = drafts.value.map((x, index) => ({ ...x, index: index + 1 }));

    // Filter enquiries to only include enquiries with no relatedActivityId
    enquiries.value = enquiries.value.filter((enquiry) => !enquiry.relatedActivityId);

    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-start h-full">
    <div class="flex flex-row items-center w-full justify-between shadow px-4">
      <h1>{{ initiativeState.headerText }}</h1>
      <img
        class="mr-4"
        src="@/assets/images/housing_2.png"
        width="120"
        alt="Housing image"
      />
    </div>

    <div class="flex flex-row items-center w-full mt-4 mb-9">
      <div class="font-bold mr-2">{{ t('e.housing.housingView.onThisPage') }}</div>
      <!-- eslint-disable vue/multiline-html-element-content-newline -->
      <!-- prettier-ignore -->
      <div>
        <router-link
          :to="{
            name: initiativeState.initiativeRouteName,
            hash: '#projects'
          }"
          class="no-underline"
          @keydown.space.prevent="router.push({ name: initiativeState.initiativeRouteName, hash: '#projects' })"
        >
        {{ t('e.housing.housingView.myProjects') }}</router-link>
        |
        <router-link
          :to="{
            name: initiativeState.initiativeRouteName,
            hash: '#drafts'
          }"
          class="no-underline"
          @keydown.space.prevent="router.push({ name: initiativeState.initiativeRouteName, hash: '#drafts' })"
        >
        {{ t('e.housing.housingView.drafts') }}</router-link>
        <span v-if="getInitiative === Initiative.HOUSING">
          |
          <router-link
            :to="{
              name: initiativeState.initiativeRouteName,
              hash: '#enquiries'
            }"
            class="no-underline"
            @keydown.space.prevent="router.push({ name: initiativeState.initiativeRouteName, hash: '#enquiries' })"
          >
          {{ t('e.housing.housingView.generalEnquiries') }}</router-link>
        </span>
      </div>
      <!-- eslint-enable vue/multiline-html-element-content-newline -->
    </div>

    <!--
      Projects
    -->
    <div class="flex flex-row items-center w-full justify-between">
      <div class="flex items-center flex-row">
        <h2
          id="projects"
          tabindex="-1"
        >
          {{ t('e.housing.housingView.myProjects') }}
        </h2>
        <Tooltip
          class="pl-2 text-xl"
          right
          :text="t('e.housing.housingView.projectsTooltip')"
        />
      </div>
      <Button @click="createIntake">
        {{ t('e.housing.housingView.submitNewProject') }}
        <font-awesome-icon
          class="ml-2"
          icon="fa-solid fa-arrow-right"
        />
      </Button>
    </div>

    <div class="w-full">
      <div
        v-if="!projects.length"
        class="flex flex-col items-center justify-center rounded-sm shadow-md custom-card px-4 py-4 bg"
      >
        <p class="font-bold">{{ t('e.housing.housingView.projectsEmpty') }}</p>
      </div>
      <div
        v-for="(project, index) in displayedProjectsInOrder"
        v-else
        :key="project.activityId"
        :index="index"
        class="rounded-sm shadow-md hover:shadow-lg px-6 py-4 custom-card hover-hand"
        :class="{
          'mb-2': index != displayedProjectsInOrder.length - 1,
          'custom-card-completed': project.applicationStatus === ApplicationStatus.COMPLETED
        }"
      >
        <router-link
          v-if="hasPendingAuth(project.activityId)"
          class="no-underline"
          :to="{
            name: initiativeState.projectRouteName,
            params: { projectId: project.projectId }
          }"
        >
          <h5 class="font-bold mb-4">{{ project.projectName }}</h5>
        </router-link>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-3 flex items-center">
            <router-link
              v-if="!hasPendingAuth(project.activityId)"
              class="no-underline"
              :to="{
                name: initiativeState.projectRouteName,
                params: { projectId: project.projectId }
              }"
            >
              <h5 class="font-bold mb-0">{{ project.projectName }}</h5>
            </router-link>
            <AuthorizationStatusPill
              v-if="hasPendingAuth(project.activityId)"
              class="my-1"
              :state="PermitState.PENDING_CLIENT"
              :display-text="t('e.housing.housingView.pendingAuths')"
            />
          </div>
          <div class="col-span-3 flex items-center">
            <p
              :class="{
                'font-bold': [ApplicationStatus.IN_PROGRESS, ApplicationStatus.NEW].includes(project.applicationStatus)
              }"
            >
              {{ project.applicationStatus }}
            </p>
          </div>
          <div class="col-span-3 flex items-center">
            <p>{{ t('e.housing.housingView.confirmationId') }}: {{ project.activityId }}</p>
          </div>
          <div class="col-span-3 flex items-center">
            <p>
              {{ t('e.housing.housingView.lastUpdated') }}:
              {{ project.updatedAt ? formatDate(project.updatedAt) : 'N/A' }}
            </p>
          </div>
        </div>
      </div>
      <div class="flex justify-end mt-2">
        <Paginator
          v-model:first="first"
          :rows="PAGE_ROWS"
          :total-records="projects.length"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          :current-page-report-template="`({currentPage} ${t('e.housing.housingView.of')} {totalPages})`"
        />
      </div>
    </div>

    <!--
      Drafts
    -->
    <div class="flex flex-row items-center w-full justify-between">
      <h2
        id="drafts"
        class="flex font-bold"
        tabindex="-1"
      >
        {{ t('e.housing.housingView.drafts') }}
      </h2>
    </div>

    <div class="w-full">
      <ProjectDraftListProponent
        :loading="loading"
        :drafts="drafts"
        @submission-draft:delete="onHousingProjectDraftDelete"
      />
    </div>

    <!--
      Enquiries
    -->
    <div
      v-if="getInitiative === Initiative.HOUSING"
      class="w-full"
    >
      <div class="flex flex-row items-center w-full justify-between">
        <div class="flex items-center flex-row">
          <h2
            id="enquiries"
            class="font-bold"
            tabindex="-1"
          >
            {{ t('e.housing.housingView.generalEnquiries') }}
          </h2>
          <Tooltip
            class="pl-2 text-xl"
            right
            :text="t('e.housing.housingView.enquiriesTooltip')"
          />
        </div>

        <Button @click="router.push({ name: initiativeState.enquiryIntakeRouteName })">
          {{ t('e.housing.housingView.submitNewEnquiry') }}
          <font-awesome-icon
            class="ml-2"
            icon="fa-solid fa-arrow-right"
          />
        </Button>
      </div>

      <div class="w-full">
        <EnquiryListProponent
          :loading="loading"
          :enquiries="enquiries"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.custom-card {
  background-color: var(--p-white);
  border: 1px solid var(--p-greyscale-200);

  &:hover {
    a {
      text-decoration: underline !important;
    }
  }
}
.custom-card-completed {
  background-color: var(--p-greyscale-50);

  &:hover {
    a {
      text-decoration: underline !important;
    }
  }
}

:deep(.p-paginator) {
  padding: 0;
}
</style>
