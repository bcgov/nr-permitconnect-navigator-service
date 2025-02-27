<script setup lang="ts">
import { onMounted, ref } from 'vue';

import EnquiryListProponent from '@/components/housing/enquiry/EnquiryListProponent.vue';
import SubmissionListProponent from '@/components/housing/submission/SubmissionListProponent.vue';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
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

function onSubmissionDraftDelete(draftId: string) {
  submissionDrafts.value = submissionDrafts.value.filter((x) => x.draftId !== draftId);
}

onMounted(async () => {
  [enquiries.value, submissions.value, submissionDrafts.value] = (
    await Promise.all([
      enquiryService.getEnquiries(),
      submissionService.getSubmissions(),
      submissionService.getDrafts()
    ])
  ).map((r) => r.data);

  submissionDrafts.value = submissionDrafts.value.map((x, index) => ({ ...x, index: index + 1 }));

  loading.value = false;
});
</script>

<template>
  <Tabs
    v-if="!loading"
    value="0"
  >
    <TabList>
      <Tab value="0">Projects</Tab>
      <Tab value="1">Enquiries</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <SubmissionListProponent
          :loading="loading"
          :submissions="submissions"
          @submission:delete="onSubmissionDelete"
        />
      </TabPanel>
      <TabPanel value="1">
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
    </TabPanels>
  </Tabs>
</template>
