<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TabPanel, TabView } from '@/lib/primevue';

import { Spinner } from '@/components/layout';
import SubmissionList from '@/components/submission/SubmissionList.vue';
import SubmissionStatistics from '@/components/submission/SubmissionStatistics.vue';
import { submissionService } from '@/services';

import type { Ref } from 'vue';
import type { Statistics, Submission } from '@/types';

// State
const loading: Ref<boolean> = ref(false);
const submissions: Ref<Array<Submission>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

// Actions
onMounted(async () => {
  loading.value = true;
  submissions.value = (await submissionService.getSubmissions()).data;
  statistics.value = (await submissionService.getStatistics()).data;
  loading.value = false;
});
</script>

<template>
  <h1>Submissions</h1>

  <TabView>
    <TabPanel header="Info">
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
  </TabView>
</template>
