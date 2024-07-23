<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Button } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { ApplicationStatus, IntakeStatus, SubmissionType } from '@/utils/enums/housing';
import ProjectsList from '@/components/housing/projects/ProjectsList.vue';
import { submissionService } from '@/services';

import type { Ref } from 'vue';
import type { Submission } from '@/types';

const router = useRouter();

// Enums
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
  <div>
    <Button
      class="p-0"
      text
    >
      <router-link :to="{ name: RouteName.HOUSING }">
        <span class="app-primary-color">Housing</span>
      </router-link>
    </Button>
    /
    <span class="font-bold">Applications and Permits</span>
  </div>
  <h1>Application and Permits</h1>
  <div class="mt-1 mb-3 flex justify-content-between">
    <h3 class="mb-0">My Projects</h3>
    <Button
      class="p-button-sm"
      outlined
      label="+ New project investigation"
      @click="router.push({ name: RouteName.HOUSING_SUBMISSION_INTAKE })"
    />
  </div>
  <ProjectsList
    :loading="loading"
    :submissions="submissions"
  />
  <div>{{ submissions.map((x) => x.submittedAt) }}</div>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}
</style>
