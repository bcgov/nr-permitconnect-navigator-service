<script setup lang="ts">
import { onMounted, ref } from 'vue';

import BackButton from '@/components/common/BackButton.vue';
import EnquiryForm from '@/components/housing/enquiry/EnquiryForm.vue';
import { Message, TabPanel, TabView } from '@/lib/primevue';
import { enquiryService, noteService, submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';

import type { Submission } from '@/types';
import type { Ref } from 'vue';
import { useEnquiryStore } from '@/store';
import { storeToRefs } from 'pinia';

// Props
type Props = {
  activityId: string;
  enquiryId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const relatedSubmission: Ref<Submission | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);

// Store
const enquiryStore = useEnquiryStore();
const { getEnquiry } = storeToRefs(enquiryStore);

// Actions
onMounted(async () => {
  if (props.enquiryId && props.activityId) {
    const [enquiry, notes] = (
      await Promise.all([enquiryService.getEnquiry(props?.enquiryId), noteService.listNotes(props?.activityId)])
    ).map((r) => r.data);
    enquiryStore.setEnquiry(enquiry);
    enquiryStore.setNotes(notes);

    if (enquiry?.relatedActivityId) {
      relatedSubmission.value = (
        await submissionService.searchSubmissions({
          activityId: [enquiry.relatedActivityId]
        })
      ).data[0];
    }
  }

  loading.value = false;
});
</script>

<template>
  <BackButton
    :route-name="RouteName.HOUSING_SUBMISSIONS"
    text="Back to Submissions"
  />

  <h1>
    Enquiry submission:
    <span
      v-if="getEnquiry?.activityId"
      class="mr-1"
    >
      {{ getEnquiry.activityId }}
    </span>
  </h1>
  <TabView>
    <TabPanel header="Information">
      <Message
        v-if="relatedSubmission"
        severity="info"
        class="text-center"
        :closable="false"
      >
        This activity is linked to Activity
        <router-link
          :to="{
            name: RouteName.HOUSING_SUBMISSION,
            query: { activityId: getEnquiry?.relatedActivityId, submissionId: relatedSubmission.submissionId }
          }"
        >
          {{ relatedSubmission.activityId }}
        </router-link>
      </Message>
      <span v-if="!loading && getEnquiry">
        <EnquiryForm :enquiry="getEnquiry" />
      </span>
    </TabPanel>
    <TabPanel header="Notes">
      <div>Notes - Coming soon</div>
    </TabPanel>
  </TabView>
</template>
