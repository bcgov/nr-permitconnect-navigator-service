<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TabPanel, TabView } from '@/lib/primevue';

import SubmissionList from '@/components/submission/SubmissionList.vue';
import SubmissionStatistics from '@/components/submission/SubmissionStatistics.vue';
import { submissionService } from '@/services';

import type { Ref } from 'vue';
import type { Submission } from '@/types';

// State
const loading: Ref<boolean> = ref(false);
const submissions: Ref<Array<Submission>> = ref([]);

// Actions
onMounted(async () => {
  loading.value = true;
  submissions.value = (await submissionService.getFormExport()).data;
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
      <SubmissionStatistics />
    </TabPanel>
  </TabView>
</template>
