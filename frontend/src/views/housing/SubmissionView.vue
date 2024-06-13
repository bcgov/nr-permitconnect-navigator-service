<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import DocumentCard from '@/components/file/DocumentCard.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import PermitCard from '@/components/permit/PermitCard.vue';
import PermitModal from '@/components/permit/PermitModal.vue';
import Roadmap from '@/components/roadmap/Roadmap.vue';
import SubmissionForm from '@/components/housing/submission/SubmissionForm.vue';
import { Button, TabPanel, TabView } from '@/lib/primevue';
import { submissionService, documentService, noteService, permitService } from '@/services';
import { useSubmissionStore, useTypeStore } from '@/store';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Props
type Props = {
  activityId: string;
  initialTab?: string;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {
  initialTab: '0'
});

// Store
const submissionStore = useSubmissionStore();
const typeStore = useTypeStore();
const { getDocuments, getNotes, getPermits, getSubmission } = storeToRefs(submissionStore);
const { getPermitTypes } = storeToRefs(typeStore);

// State
const activeTab: Ref<number> = ref(Number(props.initialTab));
const loading: Ref<boolean> = ref(true);
const noteModalVisible: Ref<boolean> = ref(false);
const permitModalVisible: Ref<boolean> = ref(false);

// Actions
onMounted(async () => {
  const [submission, documents, notes, permits, permitTypes] = (
    await Promise.all([
      submissionService.getSubmission(props.submissionId),
      documentService.listDocuments(props.activityId),
      noteService.listNotes(props.activityId),
      permitService.listPermits(props.activityId),
      permitService.getPermitTypes()
    ])
  ).map((r) => r.data);

  submissionStore.setSubmission(submission);
  submissionStore.setDocuments(documents);
  submissionStore.setNotes(notes);
  submissionStore.setPermits(permits);
  typeStore.setPermitTypes(permitTypes);

  loading.value = false;
});
</script>

<template>
  <router-link :to="{ name: RouteName.HOUSING_SUBMISSIONS }">
    <font-awesome-icon
      icon="fa fa-arrow-circle-left"
      class="mr-1"
    />
    <span>Back to Submissions</span>
  </router-link>
  <h1>
    Activity Submission:
    <span
      v-if="getSubmission?.activityId"
      class="mr-1"
    >
      {{ getSubmission.activityId }}
    </span>
    <span v-if="getSubmission?.projectName">
      -
      <span class="ml-1">{{ getSubmission.projectName }}</span>
    </span>
  </h1>

  <TabView v-model:activeIndex="activeTab">
    <TabPanel header="Information">
      <span v-if="!loading && getSubmission">
        <SubmissionForm :submission="getSubmission" />
      </span>
    </TabPanel>
    <TabPanel header="Files">
      <div class="grid nested-grid">
        <div class="col-2">
          <FileUpload :activity-id="props.activityId" />
        </div>
        <div class="col-10">
          <div class="grid">
            <div
              v-for="(document, index) in getDocuments"
              :key="document.documentId"
              :index="index"
              class="col-12 md:col-6 lg:col-4 xl:col-3"
            >
              <DocumentCard
                :document="document"
                class="hover-hand hover-shadow"
                @click="documentService.downloadDocument(document.documentId, document.filename)"
              />
            </div>
          </div>
        </div>
      </div>
    </TabPanel>
    <TabPanel header="Permits">
      <span v-if="getPermitTypes.length">
        <div class="flex align-items-center pb-2">
          <div class="flex-grow-1">
            <p class="font-bold">Applicable permits ({{ getPermits.length }})</p>
          </div>
          <Button
            aria-label="Add permit"
            @click="permitModalVisible = true"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-plus"
            />
            Add permit
          </Button>
        </div>
        <div
          v-for="(permit, index) in getPermits"
          :key="permit.permitId"
          :index="index"
          class="col-12"
        >
          <PermitCard :permit="permit" />
        </div>

        <PermitModal
          v-model:visible="permitModalVisible"
          :activity-id="props.activityId"
        />
      </span>
    </TabPanel>
    <TabPanel header="Notes">
      <div class="flex align-items-center pb-2">
        <div class="flex-grow-1">
          <p class="font-bold">Notes ({{ getNotes.length }})</p>
        </div>
        <Button
          aria-label="Add note"
          @click="noteModalVisible = true"
        >
          <font-awesome-icon
            class="pr-2"
            icon="fa-solid fa-plus"
          />
          Add note
        </Button>
      </div>
      <div
        v-for="(note, index) in getNotes"
        :key="note.noteId"
        :index="index"
        class="col-12"
      >
        <NoteCard :note="note" />
      </div>

      <NoteModal
        v-if="noteModalVisible"
        v-model:visible="noteModalVisible"
        :activity-id="props.activityId"
      />
    </TabPanel>
    <TabPanel header="Roadmap">
      <Roadmap
        v-if="!loading"
        :activity-id="props.activityId"
      />
    </TabPanel>
  </TabView>
</template>

<style scoped lang="scss">
.p-tabview {
  .p-tabview-title {
    font-size: 1.1rem;
    font-weight: bold;
  }
}
</style>
