<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import SubmissionDraftListProponent from '@/components/housing/submission/SubmissionDraftListProponent.vue';
import { Button, Paginator } from '@/lib/primevue';
import { enquiryService, submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Enquiry, Submission } from '@/types';
import EnquiryListProponent from '@/components/housing/enquiry/EnquiryListProponent.vue';

// Constants
const PAGE_ROWS = 5;

// State
const drafts: Ref<Array<any>> = ref([]);
const enquiries: Ref<Array<Enquiry>> = ref([]);
const projects: Ref<Array<Submission>> = ref([]);
const first: Ref<number> = ref(0);
const displayedProjects = computed(() => projects.value.slice(first.value, first.value + PAGE_ROWS));
const loading: Ref<boolean> = ref(true);

// Actions
const { t } = useI18n();

function onSubmissionDraftDelete(draftId: string) {
  drafts.value = drafts.value.filter((x) => x.draftId !== draftId);
}

onMounted(async () => {
  [enquiries.value, projects.value, drafts.value] = (
    await Promise.all([
      enquiryService.getEnquiries(),
      submissionService.getSubmissions(),
      submissionService.getDrafts()
    ])
  ).map((r) => r.data);

  drafts.value = drafts.value.map((x, index) => ({ ...x, index: index + 1 }));

  loading.value = false;
});
</script>

<template>
  <div class="flex flex-column align-items-center justify-content-start h-full">
    <div class="flex flex-row align-items-center w-full justify-content-between shadow-2 px-3 py-1">
      <h1>Housing</h1>
      <img
        class="mr-3"
        src="@/assets/images/housing_2.png"
        width="120"
        alt="Housing image"
      />
    </div>

    <div class="flex flex-row align-items-center w-full mt-3">
      <div class="font-bold mr-2">{{ t('housing.onThisPage') }}</div>
      <!-- eslint-disable vue/multiline-html-element-content-newline -->
      <!-- prettier-ignore -->
      <div>
        <router-link
          :to="{
            name: RouteName.HOUSING,
            hash: '#projects'
          }"
          class="no-underline"
        >
        {{ t('housing.myProjects') }}</router-link>
        |
        <router-link
          :to="{
            name: RouteName.HOUSING,
            hash: '#drafts'
          }"
          class="no-underline"
        >
        {{ t('housing.drafts') }}</router-link>
        |
        <router-link
          :to="{
            name: RouteName.HOUSING,
            hash: '#enquiries'
          }"
          class="no-underline"
        >
        {{ t('housing.generalEnquiries') }}</router-link>
      </div>
      <!-- eslint-enable vue/multiline-html-element-content-newline -->
    </div>

    <!--
      Projects
    -->
    <div class="flex flex-row align-items-center w-full justify-content-between mt-3">
      <h2
        id="projects"
        class="flex font-bold"
      >
        {{ t('housing.myProjects') }}
        <div
          v-tooltip.right="t('housing.projectsTooltip')"
          class="flex align-items-center pl-2 text-xl"
        >
          <font-awesome-icon icon="fa-solid fa-circle-info" />
        </div>
      </h2>
      <router-link :to="{ name: RouteName.HOUSING_SUBMISSION_INTAKE }">
        <Button>
          {{ t('housing.submitNewProject') }}
          <font-awesome-icon
            class="ml-2"
            icon="fa-solid fa-arrow-right"
          />
        </Button>
      </router-link>
    </div>

    <div class="w-full">
      <div
        v-if="!projects.length"
        class="flex flex-column align-items-center justify-content-center border-round-xs shadow-3 px-3 py-1 bg"
      >
        <p class="font-bold">{{ t('housing.projectsEmpty') }}</p>
      </div>
      <div
        v-for="(project, index) in displayedProjects"
        v-else
        :key="project.activityId"
        :index="index"
        class="align-items-center border-round-xs shadow-3 px-4 bg"
        :class="[index != displayedProjects.length - 1 ? 'mb-4' : '']"
      >
        <div class="grid">
          <div class="col-3 flex align-items-center">
            <router-link
              :to="{
                name: RouteName.HOUSING_SUBMISSION_INTAKE,
                query: { activityId: project.activityId, submissionId: project.submissionId }
              }"
            >
              <h4 class="mb-0">{{ project.projectName }}</h4>
            </router-link>
          </div>
          <div class="col-3">
            <p>{{ t('housing.projectState') }}: {{ project.applicationStatus }}</p>
          </div>
          <div class="col-3">
            <p>{{ t('housing.confirmationId') }}: {{ project.activityId }}</p>
          </div>
          <div class="col-3">
            <p>{{ t('housing.lastUpdated') }}: {{ project.updatedAt ? formatDate(project.updatedAt) : 'N/A' }}</p>
          </div>
        </div>
      </div>
      <div class="flex justify-content-end mt-2">
        <Paginator
          v-model:first="first"
          :rows="PAGE_ROWS"
          :total-records="projects.length"
          template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          :current-page-report-template="`({currentPage} ${t('housing.of')} {totalPages})`"
        />
      </div>
    </div>

    <!--
      Drafts
    -->
    <div class="flex flex-row align-items-center w-full justify-content-between mt-3">
      <h2
        id="drafts"
        class="flex font-bold"
      >
        {{ t('housing.drafts') }}
      </h2>
    </div>

    <div class="w-full">
      <SubmissionDraftListProponent
        :loading="loading"
        :drafts="drafts"
        @submission-draft:delete="onSubmissionDraftDelete"
      />
    </div>

    <!--
      Enquiries
    -->
    <div class="flex flex-row align-items-center w-full justify-content-between mt-3">
      <h2
        id="enquiries"
        class="flex font-bold"
      >
        {{ t('housing.generalEnquiries') }}
        <div
          v-tooltip.right="t('housing.enquiriesTooltip')"
          class="flex align-items-center pl-2 text-xl"
        >
          <font-awesome-icon icon="fa-solid fa-circle-info" />
        </div>
      </h2>
      <router-link :to="{ name: RouteName.HOUSING_ENQUIRY_INTAKE }">
        <Button>
          {{ t('housing.submitNewEnquiry') }}
          <font-awesome-icon
            class="ml-2"
            icon="fa-solid fa-arrow-right"
          />
        </Button>
      </router-link>
    </div>

    <div class="w-full">
      <EnquiryListProponent
        :loading="loading"
        :enquiries="enquiries"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.bg {
  background-color: #f7f9fc;
}

:deep(.p-paginator) {
  padding: 0;
}
</style>
