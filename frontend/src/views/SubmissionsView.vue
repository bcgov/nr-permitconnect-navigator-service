<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TabPanel, TabView } from '@/lib/primevue';

import { Spinner } from '@/components/layout';
import SubmissionBringForwardCalendar from '@/components/submission/SubmissionBringForwardCalendar.vue';
import SubmissionList from '@/components/submission/SubmissionList.vue';
import SubmissionStatistics from '@/components/submission/SubmissionStatistics.vue';
import { noteService, submissionService } from '@/services';

import type { Ref } from 'vue';
import type { BringForward, Statistics, Submission } from '@/types';

// State
const loading: Ref<boolean> = ref(false);
const bringForward: Ref<Array<BringForward>> = ref([]);
const submissions: Ref<Array<Submission>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

// Actions
onMounted(async () => {
  loading.value = true;
  submissions.value = (await submissionService.getSubmissions()).data;
  statistics.value = (await submissionService.getStatistics()).data;
  bringForward.value = (await noteService.listBringForward()).data;
  loading.value = false;
});
</script>

<template>
  <h1>Submissions</h1>

  <TabView>
    <TabPanel header="List">
      <SubmissionList
        :loading="loading"
        :submissions="submissions"
      />
    </TabPanel>
    <TabPanel header="Statistics">
      <SubmissionStatistics
        v-if="statistics"
        :loading="loading"
        :initial-statistics="statistics"
      />
      <div v-else>
        <span v-if="loading">
          <Spinner />
          Loading statistics...
        </span>
        <span v-else>Failed to load statistics.</span>
      </div>
    </TabPanel>
    <TabPanel header="Bring Forward Calendar">
      <SubmissionBringForwardCalendar
        :loading="loading"
        :bringForward="bringForward"
      />
    </TabPanel>
  </TabView>
</template>
