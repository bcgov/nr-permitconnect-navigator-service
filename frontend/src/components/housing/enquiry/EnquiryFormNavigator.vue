<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { onBeforeMount, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { object, string } from 'yup';

import EnquiryEditForm from '@/components/housing/enquiry/EnquiryEditForm.vue';
import { Button, Card, Divider, Message, TabPanel, TabView, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService, noteService, submissionService } from '@/services';
import { useEnquiryStore } from '@/store';
import { ContactPreferenceList, ProjectRelationshipList, Regex, RouteNames, YesNo } from '@/utils/constants';
import { BASIC_RESPONSES, INTAKE_FORM_CATEGORIES, INTAKE_STATUS_LIST } from '@/utils/enums';

import type { Ref } from 'vue';

// NEED TO SORT
const enquiryStore = useEnquiryStore();
const { getEnquiry, getNotes } = storeToRefs(enquiryStore);

// Props
type Props = {
  activityId?: string;
  enquiryId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  enquiryId: undefined
});

// State
// const assignedActivityId: Ref<string | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const router = useRouter();
// const toast = useToast();

function confirmLeave() {
  confirm.require({
    message: 'Are you sure you want to leave this page? Any unsaved changes will be lost. Please save as draft first.',
    header: 'Leave this page?',
    acceptLabel: 'Leave',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => router.push({ name: RouteNames.HOUSING })
  });
}

onBeforeMount(async () => {
  if (props.activityId) {
    enquiryStore.setEnquiry((await noteService.listNotes(props.activityId)).data);
  }
  if (props.enquiryId) {
    enquiryStore.setEnquiry((await enquiryService.getEnquiry(props.enquiryId)).data);
  }
});
</script>

<template>
  <div>
    <Button
      class="mb-3 p-0"
      text
      @click="confirmLeave"
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
        v-if="getEnquiry?.activityId"
        class="mr-1"
      >
        {{ getEnquiry.activityId }}
      </span>
    </h1>
    <div>{{ getEnquiry }}</div>
    <div class="mt-2">{{ getNotes }}</div>
    <TabView>
      <TabPanel header="Info">
        <EnquiryEditForm />
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
