<script setup lang="ts">
import { onMounted, ref } from 'vue';

import DocumentCard from '@/components/file/DocumentCard.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import PermitCard from '@/components/permit/PermitCard.vue';
import PermitModal from '@/components/permit/PermitModal.vue';
import Roadmap from '@/components/roadmap/Roadmap.vue';
import SubmissionForm from '@/components/submission/SubmissionForm.vue';
import { Button, TabPanel, TabView, useToast } from '@/lib/primevue';
import { submissionService, documentService, noteService, permitService } from '@/services';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Document, Note, Permit, PermitType, Submission } from '@/types';

// Props
type Props = {
  activityId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const documents: Ref<Array<Document>> = ref([]);
const editable: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(true);
const notes: Ref<Array<Note>> = ref([]);
const noteModalVisible: Ref<boolean> = ref(false);
const permits: Ref<Array<Permit>> = ref([]);
const permitModalVisible: Ref<boolean> = ref(false);
const permitTypes: Ref<Array<PermitType>> = ref([]);
const submission: Ref<Submission | undefined> = ref(undefined);

// Actions
const toast = useToast();

const onPermitDelete = (data: Permit) =>
  (permits.value = permits.value.filter((x: Permit) => x.permitId !== data.permitId));

async function onPermitSubmit(data: Permit) {
  try {
    const result = (await permitService.createPermit({ ...data, activityId: props.activityId })).data;
    permits.value.push(result);
    toast.success('Permit saved');
  } catch (e: any) {
    toast.error('Failed to save permit', e.message);
  } finally {
    permitModalVisible.value = false;
  }
}

async function onNoteSubmit(data: any) {
  try {
    const result = (await noteService.createNote({ ...data, activityId: props.activityId })).data;
    notes.value.unshift(result);
    toast.success('Note saved');
  } catch (e: any) {
    toast.error('Failed to save note', e.message);
  } finally {
    noteModalVisible.value = false;
  }
}

async function onSubmissionSubmit(data: Submission) {
  editable.value = false;
  await submissionService.updateSubmission(data.submissionId, {
    ...data
  });
  toast.success('Form saved');
}

onMounted(async () => {
  [submission.value, documents.value, notes.value, permits.value, permitTypes.value] = (
    await Promise.all([
      submissionService.getSubmission(props.activityId),
      documentService.listDocuments(props.activityId),
      noteService.listNotes(props.activityId),
      permitService.listPermits(props.activityId),
      permitService.getPermitTypes()
    ])
  ).map((r) => r.data);

  loading.value = false;
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
      v-if="submission?.activityId"
      class="mr-1"
    >
      {{ submission.activityId }}
    </span>
    <span v-if="submission?.projectName">
      -
      <span class="ml-1">{{ submission.projectName }}</span>
    </span>
  </h1>

  <TabView>
    <TabPanel header="Info">
      <span v-if="!loading">
        <Button
          v-if="!editable"
          class="mb-3"
          :disabled="editable"
          @click="editable = true"
        >
          Edit
        </Button>

        <SubmissionForm
          :editable="editable"
          :submission="submission as Submission"
          @cancel="editable = false"
          @submit="onSubmissionSubmit"
        />
      </span>
    </TabPanel>
    <TabPanel header="Files">
      <div class="grid nested-grid">
        <div class="col-2">
          <FileUpload
            :activity-id="props.activityId"
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
      <span v-if="permitTypes.length">
        <div class="flex flex-row pb-2">
          <div class="flex flex-grow-1 align-items-end">
            <p class="font-bold">Applicable permits ({{ permits.length }})</p>
          </div>
          <div class="flex flex-none">
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
        </div>
        <div
          v-for="(permit, index) in permits"
          :key="permit.permitId"
          :index="index"
          class="col-12"
        >
          <PermitCard
            :permit="permit"
            :permit-types="permitTypes"
            @permit:delete="onPermitDelete"
          />
        </div>

        <PermitModal
          v-model:visible="permitModalVisible"
          :permit-types="permitTypes"
          @permit:submit="onPermitSubmit"
        />
      </span>
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
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-plus"
            />
            Add note
          </Button>
        </div>
      </div>
      <div
        v-for="(note, index) in notes"
        :key="note.noteId"
        :index="index"
        class="col-12"
      >
        <NoteCard :note="note" />
      </div>

      <NoteModal
        v-model:visible="noteModalVisible"
        @note:submit="onNoteSubmit"
      />
    </TabPanel>
    <TabPanel header="Roadmap">
      <Roadmap
        v-if="!loading"
        :activity-id="activityId"
        :documents="documents"
        :permits="permits"
        :permit-types="permitTypes"
        :submission="submission as Submission"
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
