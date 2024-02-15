<script setup lang="ts">
import { onMounted, ref } from 'vue';

import DocumentCard from '@/components/file/DocumentCard.vue';
import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import PermitCard from '@/components/permit/PermitCard.vue';
import PermitModal from '@/components/permit/PermitModal.vue';
import SubmissionForm from '@/components/submission/SubmissionForm.vue';
import { Button, TabPanel, TabView, useToast } from '@/lib/primevue';
import { submissionService, documentService, permitService } from '@/services';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Document, Permit, Note } from '@/types';

// Props
type Props = {
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const documents: Ref<Array<Document>> = ref([]);
const editable: Ref<boolean> = ref(false);
const submission: Ref<any | undefined> = ref(undefined);
const documents: Ref<Array<Document>> = ref([]);
const notes: Ref<Array<Note>> = ref([]);
const noteModalVisible: Ref<boolean> = ref(false);
const permits: Ref<Array<Permit>> = ref([]);
const permitModalVisible: Ref<boolean> = ref(false);
const submission: Ref<Submission | undefined> = ref(undefined);

// Actions
const toast = useToast();

const onPermitDelete = (data: Permit) =>
  (permits.value = permits.value.filter((x: Permit) => x.permitId !== data.permitId));

async function onPermitSubmit(data: Permit) {
  try {
    const result = (await permitService.createPermit({ ...data, submissionId: props.submissionId })).data;
    permits.value.push(result);
    toast.success('Permit saved');
  } catch (e: any) {
    toast.error('Failed to save permit', e.message);
  } finally {
    permitModalVisible.value = false;
  }
async function onNoteSubmit(data: any) {
  try {
    const result = (await noteService.createNote({ ...data, submissionId: props.submissionId })).data;
    toast.success('Note saved');
    notes.value.unshift(result);
  } catch {
    toast.error('Note save error');
  }

  noteModalVisible.value = false;

}

async function onSubmissionSubmit(data: Submission) {
  editable.value = false;
  await submissionService.updateSubmission(props.submissionId, {
    ...data,
    submissionId: props.submissionId
  });
  toast.success('Form saved');
}

onMounted(async () => {
  submission.value = (await submissionService.getSubmission(props.submissionId)).data;
  documents.value = (await documentService.listDocuments(props.submissionId)).data;
  notes.value = (await noteService.listNotes(props.submissionId)).data;
  permits.value = (await permitService.listPermits(props.submissionId)).data;
});
</script>

<template>
  <router-link :to="{ name: RouteNames.SUBMISSIONS }">
    <font-awesome-icon
      icon="fa fa-arrow-circle-left"
      class="mr-1"
    />
    <span>Back to Submissions</span>
  </router-link>
  <h1>
    Activity submission:
    <span
      v-if="submission?.activity.activityId"
      class="mr-1"
    >
      {{ submission.activity.activityId }}
    </span>
    <span v-if="submission?.projectName">
      -
      <span class="ml-1">{{ submission.projectName }}</span>
    </span>
  </h1>

  <TabView>
    <TabPanel header="Info">
      <Button
        class="mb-3"
        :disabled="editable"
        @click="editable = true"
      >
        Edit
      </Button>

      <SubmissionForm
        v-if="submission"
        :editable="editable"
        :submission="submission"
        @cancel="editable = false"
        @submit="onSubmissionSubmit"
      />
    </TabPanel>
    <TabPanel header="Files">
      <div class="grid nested-grid">
        <div class="col-2">
          <FileUpload
            :submission-id="props.submissionId"
            @update:last-uploaded-document="(e: Document) => documents.push(e)"
          />
        </div>
        <div class="col-10">
          <div class="grid">
            <div
              v-for="(document, index) in documents"
              :key="document.documentId"
              :index="index"
              class="col-12 md:col-6 lg:col-4 xl:col-3"
            >
              <DocumentCard
                :document="document"
                class="hover-hand hover-shadow"
                @click="documentService.downloadDocument(document.documentId)"
                @document:deleted="
                  (documentId) => (documents = documents.filter((x: Document) => x.documentId !== documentId))
                "
              />
            </div>
          </div>
        </div>
      </div>
    </TabPanel>
    <TabPanel header="Permits">
      <div class="flex flex-row pb-2">
        <div class="flex flex-grow-1 align-items-end">
          <p class="font-bold">Applicable permits ({{ permits.length }})</p>
        </div>
        <div class="flex flex-none">
          <Button
            aria-label="Add permit"
            @click="permitModalVisible = true"
          >
            <font-awesome-icon icon="fa-solid fa-plus" />
            &nbsp; Add permit
          </Button>
        </div>
      </div>
      <div
        v-for="(permit, index) in permits"
        :key="permit.permitId"
        :index="index"
        class="col-12"
      >
        <PermitCard
          :permit="permit"
          :submission-id="submissionId"
          @permit:delete="onPermitDelete"
        />
      </div>

      <PermitModal
        v-model:visible="permitModalVisible"
        @permit:submit="onPermitSubmit"
      />
    </TabPanel>
    <TabPanel header="Notes">
      <div class="flex flex-row pb-2">
        <div class="flex flex-grow-1 align-items-end">
          <p class="font-bold">Notes ({{ notes.length }})</p>
        </div>
        <div class="flex flex-none">
          <Button
            aria-label="Add permit"
            @click="noteModalVisible = true"
          >
            <font-awesome-icon icon="fa-solid fa-plus" />
            &nbsp; Add note
          </Button>
        </div>
      </div>
      <div
        v-for="(note, index) in notes"
        :key="note.noteId"
        :index="index"
        class="col-12"
      >
        <NoteCard
          :note="note"
          :submission-id="submissionId"
        />
      </div>

      <NoteModal
        v-model:visible="noteModalVisible"
        @note:submit="onNoteSubmit"
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
