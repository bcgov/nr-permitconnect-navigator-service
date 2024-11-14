<script setup lang="ts">
import { onMounted, ref } from 'vue';

import EnquiryListProponent from '@/components/housing/enquiry/EnquiryListProponent.vue';
import SubmissionListProponent from '@/components/housing/submission/SubmissionListProponent.vue';
import { TabPanel, TabView } from '@/lib/primevue';
import { enquiryService, submissionService } from '@/services';
import type { Ref } from 'vue';
import type { Enquiry, Submission } from '@/types';
import SubmissionDraftListProponent from './SubmissionDraftListProponent.vue';

// State
const enquiries: Ref<Array<Enquiry>> = ref([]);
const loading: Ref<boolean> = ref(true);
const submissions: Ref<Array<Submission>> = ref([]);
const submissionDrafts: Ref<Array<any>> = ref([]);

// Actions
function onSubmissionDelete(submissionId: string) {
  submissions.value = submissions.value.filter((x) => x.submissionId !== submissionId);
}

function onSubmissionDraftDelete(submissionDraftId: string) {
  submissionDrafts.value = submissionDrafts.value.filter((x) => x.submissionDraftId !== submissionDraftId);
}

onMounted(async () => {
  [enquiries.value, submissions.value, submissionDrafts.value] = (
    await Promise.all([
      enquiryService.getEnquiries(),
      submissionService.getSubmissions(),
      submissionService.getSubmissionDrafts()
    ])
  ).map((r) => r.data);

  submissionDrafts.value = submissionDrafts.value.map((x, index) => ({ ...x, index: index + 1 }));

  loading.value = false;
});
</script>

<template>
  <TabView v-if="!loading">
    <TabPanel header="Projects">
      <SubmissionListProponent
        :loading="loading"
        :submissions="submissions"
        @submission:delete="onSubmissionDelete"
      />
    </TabPanel>
    <TabPanel header="Enquiries">
      <EnquiryListProponent
        :loading="loading"
        :enquiries="enquiries"
      />
    </TabPanel>
    <TabPanel header="Drafts">
      <SubmissionDraftListProponent
        :loading="loading"
        :drafts="submissionDrafts"
        @submission-draft:delete="onSubmissionDraftDelete"
      />
    </TabPanel>
  </TabView>
</template>
