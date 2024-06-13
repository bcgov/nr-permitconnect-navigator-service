<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import EnquiryEditForm from '@/components/housing/enquiry/EnquiryEditForm.vue';
import { Button, Message, TabPanel, TabView } from '@/lib/primevue';
import { enquiryService, noteService, PermissionService, submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';

import type { Submission } from '@/types';
import type { Ref } from 'vue';
// Props
type Props = {
  enquiry: any;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const relatedSubmission: Ref<Submission | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);

// Store
const enquiryStore = useEnquiryStore();
const { getEnquiry } = storeToRefs(enquiryStore);
const permissionService = new PermissionService();

// Actions
const router = useRouter();

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
    loading.value = false;
  } else {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <Button
      class="mb-3 p-0"
      text
      @click="router.push({ name: RouteName.HOUSING_SUBMISSIONS })"
    >
      <font-awesome-icon
        icon="fa fa-arrow-circle-left"
        class="mr-1"
      />
      <span>Back to Housing</span>
    </Button>
    <h1>
      Enquiry submission:
      <span
        v-if="enquiry?.activityId"
        class="mr-1"
      >
        {{ enquiry.activityId }}
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
              query: { activityId: props.enquiry.relatedActivityId, submissionId: relatedSubmission.submissionId }
            }"
          >
            {{ relatedSubmission.activityId }}
          </router-link>
        </Message>
        <EnquiryEditForm :enquiry="getEnquiry" />
      </TabPanel>
      <TabPanel header="Notes">
        <div>Notes - Coming soon</div>
      </TabPanel>
    </TabView>
  </div>
</template>
