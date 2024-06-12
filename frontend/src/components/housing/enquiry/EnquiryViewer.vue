<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import EnquiryEditForm from '@/components/housing/enquiry/EnquiryEditForm.vue';
import { Button, Message, TabPanel, TabView } from '@/lib/primevue';
import { submissionService } from '@/services';
import { RouteNames } from '@/utils/constants';

import type { Submission } from '@/types';
import type { Ref } from 'vue';
// Props
type Props = {
  enquiry: any;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const relatedSubmission: Ref<Submission | undefined> = ref(undefined);

// Actions
const router = useRouter();

onMounted(async () => {
  if (props?.enquiry?.relatedActivityId) {
    relatedSubmission.value = (
      await submissionService.searchSubmissions({
        activityId: [props.enquiry.relatedActivityId]
      })
    ).data[0];
  }
});
</script>

<template>
  <div>
    <Button
      class="mb-3 p-0"
      text
      @click="router.push({ name: RouteNames.HOUSING_SUBMISSIONS })"
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
      <TabPanel header="Info">
        <Message
          v-if="relatedSubmission"
          severity="info"
          class="text-center"
          :closable="false"
        >
          This activity is linked to Activity
          <router-link
            :to="{
              name: RouteNames.HOUSING_SUBMISSION,
              query: { activityId: props.enquiry.relatedActivityId, submissionId: relatedSubmission.submissionId }
            }"
          >
            {{ relatedSubmission.activityId }}
          </router-link>
        </Message>
        <EnquiryEditForm :enquiry="props.enquiry" />
      </TabPanel>
      <TabPanel header="Notes">
        <div>Notes</div>
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss">
.disclaimer {
  font-weight: 500;
}

.p-card {
  border-color: rgb(242, 241, 241);
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  margin-bottom: 1rem;

  .section-header {
    padding-left: 1rem;
    padding-right: 0.5rem;
  }

  :deep(.p-card-title) {
    font-size: 1rem;
  }

  :deep(.p-card-body) {
    padding-bottom: 0.5rem;

    padding-left: 0;
    padding-right: 0;
  }

  :deep(.p-card-content) {
    padding-bottom: 0;
    padding-top: 0;

    padding-left: 1rem;
    padding-right: 1rem;
  }
}

:deep(.p-message-wrapper) {
  padding: 0.5rem;
}

:deep(.p-invalid),
:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: $app-error !important;
}
</style>
