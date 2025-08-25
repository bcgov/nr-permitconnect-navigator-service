<script setup lang="ts">
import { computed, nextTick, onBeforeMount, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import SubmissionDraftListProponent from '@/components/projectCommon/submission/SubmissionDraftListProponent.vue';
import { Button, Paginator } from '@/lib/primevue';
import { electrificationProjectService, permitService } from '@/services';
import { useContactStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus } from '@/utils/enums/permit';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { draftableProjectServiceKey, projectRouteNameKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { ElectrificationProject, Permit } from '@/types';

// Constants
const PAGE_ROWS = 5;

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// State
const authorizations: Ref<Array<Permit>> = ref([]);
const drafts: Ref<Array<any>> = ref([]);
const first: Ref<number> = ref(0);
const loading: Ref<boolean> = ref(true);
const projects: Ref<Array<ElectrificationProject>> = ref([]);

// Providers
provide(projectRouteNameKey, RouteName.EXT_ELECTRIFICATION_INTAKE);
provide(draftableProjectServiceKey, electrificationProjectService);

// Actions
async function createIntake() {
  const contact = useContactStore().getContact;
  const response = await electrificationProjectService.updateDraft({
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
    name: RouteName.EXT_ELECTRIFICATION_INTAKE,
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
    (auth) => auth.activityId === activityId && auth.authStatus === PermitAuthorizationStatus.PENDING
  );
});

function onElectrificationProjectDraftDelete(draftId: string) {
  drafts.value = drafts.value.filter((x) => x.draftId !== draftId);
}

function sortByLastUpdated(a: ElectrificationProject, b: ElectrificationProject) {
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
  [authorizations.value, projects.value, drafts.value] = (
    await Promise.all([
      permitService.listPermits(),
      electrificationProjectService.searchProjects(),
      electrificationProjectService.getDrafts()
    ])
  ).map((r) => r.data);

  // Sort by last updated, push non-updated projects to bottom
  projects.value.sort(sortByLastUpdated);

  drafts.value = drafts.value.map((x, index) => ({ ...x, index: index + 1 }));

  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col items-center justify-start h-full">
    <div class="flex flex-row items-center w-full justify-between shadow px-4">
      <h1>{{ t('e.electrification.electrificationView.electrification') }}</h1>
      <img
        class="mr-4"
        src="@/assets/images/elec_banner.png"
        width="120"
        alt="Electrification image"
      />
    </div>

    <div class="flex flex-row items-center w-full mt-4 mb-9">
      <div class="font-bold mr-2">{{ t('e.electrification.electrificationView.onThisPage') }}</div>
      <!-- eslint-disable vue/multiline-html-element-content-newline -->
      <!-- prettier-ignore -->
      <div>
        <router-link
          :to="{
            name: RouteName.EXT_ELECTRIFICATION,
            hash: '#projects'
          }"
          class="no-underline"
          @keydown.space.prevent="router.push({ name: RouteName.EXT_ELECTRIFICATION, hash: '#projects' })"
        >
        {{ t('e.electrification.electrificationView.myProjects') }}</router-link>
        |
        <router-link
          :to="{
            name: RouteName.EXT_ELECTRIFICATION,
            hash: '#drafts'
          }"
          class="no-underline"
          @keydown.space.prevent="router.push({ name: RouteName.EXT_ELECTRIFICATION, hash: '#drafts' })"
        >
        {{ t('e.electrification.electrificationView.drafts') }}</router-link>
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
          {{ t('e.electrification.electrificationView.myProjects') }}
        </h2>
        <Tooltip
          class="pl-2 text-xl"
          right
          :text="t('e.electrification.electrificationView.projectsTooltip')"
        />
      </div>
      <Button @click="createIntake">
        {{ t('e.electrification.electrificationView.submitNewProject') }}
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
        <p class="font-bold">{{ t('e.electrification.electrificationView.projectsEmpty') }}</p>
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
            name: RouteName.EXT_ELECTRIFICATION_PROJECT,
            params: { projectId: project.electrificationProjectId }
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
                name: RouteName.EXT_ELECTRIFICATION_PROJECT,
                params: { projectId: project.electrificationProjectId }
              }"
            >
              <h5 class="font-bold mb-0">{{ project.projectName }}</h5>
            </router-link>
            <AuthorizationStatusPill
              v-if="hasPendingAuth(project.activityId)"
              class="my-1"
              :auth-status="PermitAuthorizationStatus.PENDING"
              :display-text="t('e.electrification.electrificationView.pendingAuths')"
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
            <p>{{ t('e.electrification.electrificationView.confirmationId') }}: {{ project.activityId }}</p>
          </div>
          <div class="col-span-3 flex items-center">
            <p>
              {{ t('e.electrification.electrificationView.lastUpdated') }}:
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
          :current-page-report-template="`
            ({currentPage} ${t('e.electrification.electrificationView.of')} {totalPages})
          `"
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
        {{ t('e.electrification.electrificationView.drafts') }}
      </h2>
    </div>

    <div class="w-full">
      <SubmissionDraftListProponent
        :loading="loading"
        :drafts="drafts"
        @submission-draft:delete="onElectrificationProjectDraftDelete"
      />
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
