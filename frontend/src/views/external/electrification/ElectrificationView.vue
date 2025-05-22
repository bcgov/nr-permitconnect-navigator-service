<script setup lang="ts">
import { computed, nextTick, onBeforeMount, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import Tooltip from '@/components/common/Tooltip.vue';
import SubmissionDraftListProponent from '@/components/projectCommon/submission/SubmissionDraftListProponent.vue';
import { Button, Paginator } from '@/lib/primevue';
import { electrificationProjectService } from '@/services';
import { useContactStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';
import { draftableProjectServiceKey, projectRouteNameKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { ElectrificationProject } from '@/types';

// Constants
const PAGE_ROWS = 5;

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// State
const displayedProjects = computed(() => projects.value.slice(first.value, first.value + PAGE_ROWS));
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
  [projects.value, drafts.value] = (
    await Promise.all([
      electrificationProjectService.searchProjects({ includeDeleted: false }),
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
        v-for="(project, index) in displayedProjects"
        v-else
        :key="project.activityId"
        :index="index"
        class="rounded-sm shadow-md hover:shadow-lg px-6 py-4 custom-card hover-hand"
        :class="{ 'mb-2': index != displayedProjects.length - 1 }"
      >
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-3 flex items-center">
            <router-link
              class="no-underline"
              :to="{
                name: RouteName.EXT_ELECTRIFICATION_PROJECT,
                params: { projectId: project.electrificationProjectId }
              }"
            >
              <h4 class="font-bold mb-0">{{ project.projectName }}</h4>
            </router-link>
          </div>
          <div class="col-span-3 flex items-center">
            <p>{{ t('e.electrification.electrificationView.projectState') }}: {{ project.applicationStatus }}</p>
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
  background-color: #f7f9fc;

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
