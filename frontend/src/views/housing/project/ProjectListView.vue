<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import Breadcrumb from '@/components/common/Breadcrumb.vue';
import ProjectsList from '@/components/housing/projects/ProjectsList.vue';
import { Button } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { ApplicationStatus, IntakeStatus, SubmissionType } from '@/utils/enums/housing';
import { submissionService } from '@/services';

import type { Ref } from 'vue';
import type { Submission } from '@/types';
import type { MenuItem } from 'primevue/menuitem';

const router = useRouter();

// Constants
const breadcrumbHome: MenuItem = { label: 'Housing', route: RouteName.HOUSING };
const breadcrumbItems: Array<MenuItem> = [{ label: 'Applications and Permits', class: 'font-bold' }];
const IntakeSearchParams: String[] = [IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED];
const SubmissionSearchParams: String[] = [SubmissionType.GUIDANCE];

// State
const loading: Ref<boolean> = ref(true);
const submissions: Ref<Array<Submission>> = ref([]);

// Actions

// Sort ApplicationStatus "completed" to the bottom of list, then sort by submission date
function customSort(a: Submission, b: Submission): number {
  if (a.applicationStatus == ApplicationStatus.COMPLETED) {
    if (b.applicationStatus == ApplicationStatus.COMPLETED) {
      return a.submittedAt > b.submittedAt ? -1 : 1;
    } else {
      return 1;
    }
  }

  if (b.applicationStatus == ApplicationStatus.COMPLETED) {
    return -1;
  }

  return a.submittedAt > b.submittedAt ? -1 : 1;
}

onMounted(async () => {
  const [unsorted] = (
    await Promise.all([
      submissionService.searchSubmissions({
        includeUser: true,
        intakeStatus: IntakeSearchParams,
        submissionType: SubmissionSearchParams
      })
    ])
  ).map((r) => r.data);

  submissions.value = unsorted.sort(customSort);

  loading.value = false;
});
</script>

<template>
  <Breadcrumb
    :home="breadcrumbHome"
    :model="breadcrumbItems"
  />
  <div class="app-primary-color">
    <h1 class="mt-7">Applications and Permits</h1>
    <div class="mt-7 mb-5 flex justify-content-between">
      <h3 class="mb-0">My Projects</h3>
      <Button
        class="p-button-sm"
        outlined
        label="+ New project investigation"
        @click="router.push({ name: RouteName.HOUSING_SUBMISSION_INTAKE })"
      />
    </div>
  </div>
  <ProjectsList
    :loading="loading"
    :submissions="submissions"
  />
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}
</style>
