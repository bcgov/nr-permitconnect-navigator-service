<script setup lang="ts">
import { onMounted, ref } from 'vue';

import EnquiryListProponent from '@/components/housing/enquiry/EnquiryListProponent.vue';
import SubmissionListProponent from '@/components/housing/submission/SubmissionListProponent.vue';
import { TabPanel, Tabs, Tab, TabList, TabPanels } from '@/lib/primevue';
import { enquiryService, submissionService } from '@/services';
import type { Ref } from 'vue';
import type { Enquiry, Submission } from '@/types';

// State
const enquiries: Ref<Array<Enquiry>> = ref([]);
const loading: Ref<boolean> = ref(true);
const submissions: Ref<Array<Submission>> = ref([]);

// Actions
function onEnquiryDelete(enquiryId: string) {
  enquiries.value = enquiries.value.filter((x) => x.enquiryId !== enquiryId);
}

function onSubmissionDelete(submissionId: string) {
  submissions.value = submissions.value.filter((x) => x.submissionId !== submissionId);
}

onMounted(async () => {
  [enquiries.value, submissions.value] = (
    await Promise.all([enquiryService.getEnquiries(), submissionService.getSubmissions()])
  ).map((r) => r.data);

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
          @enquiry:delete="onEnquiryDelete"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
