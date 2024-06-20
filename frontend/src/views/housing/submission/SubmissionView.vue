<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { filesize } from 'filesize';
import { computed, onMounted, ref } from 'vue';

import BackButton from '@/components/common/BackButton.vue';
import DeleteDocument from '@/components/file/DeleteDocument.vue';
import DocumentCard from '@/components/file/DocumentCard.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import PermitCard from '@/components/permit/PermitCard.vue';
import PermitModal from '@/components/permit/PermitModal.vue';
import Roadmap from '@/components/roadmap/Roadmap.vue';
import SubmissionForm from '@/components/housing/submission/SubmissionForm.vue';
import { Button, Column, DataTable, IconField, InputIcon, InputText, TabPanel, TabView } from '@/lib/primevue';
import { submissionService, documentService, noteService, permitService } from '@/services';
import { useSubmissionStore, useTypeStore } from '@/store';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import { formatDateLong } from '@/utils/formatters';

// Props
type Props = {
  activityId: string;
  initialTab?: string;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {
  initialTab: '0'
});

//Constants
const SORT_ORDER = {
  ASCENDING: 1,
  DESCENDING: -1
};
const SORT_TYPES = {
  CREATED_AT: 'createdAt',
  FILENAME: 'filename',
  FILESIZE: 'filesize',
  MIME_TYPE: 'mimeType',
  CREATED_BY: 'createdByFullName'
};

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
const gridView: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const sortOrder: Ref<number> = ref(Number(SORT_ORDER.DESCENDING));
const sortType: Ref<string> = ref(SORT_TYPES.CREATED_AT);

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

// Actions

function sortComparator(sortValue: number, a: any, b: any) {
  return sortValue === SORT_ORDER.ASCENDING ? (a > b ? 1 : -1) : a < b ? 1 : -1;
}

const filteredDocuments = computed(() => {
  let tempDocuments = getDocuments.value;
  tempDocuments = tempDocuments.filter((x) => {
    return searchTag.value ? x.filename.toLowerCase().includes(searchTag.value.toLowerCase()) : x;
  });
  switch (sortType.value) {
    case SORT_TYPES.FILENAME:
      tempDocuments = tempDocuments.sort((a, b) =>
        sortComparator(sortOrder.value, a.filename.toLowerCase(), b.filename.toLowerCase())
      );
      break;
    case SORT_TYPES.CREATED_AT:
      tempDocuments = tempDocuments.sort((a, b) => sortComparator(sortOrder.value, a.createdAt ?? 0, b.createdAt ?? 0));
      break;
    case SORT_TYPES.FILESIZE:
      tempDocuments = tempDocuments.sort((a, b) => sortComparator(sortOrder.value, a.filesize, b.filesize));
      break;
    case SORT_TYPES.MIME_TYPE:
      tempDocuments = tempDocuments.sort((a, b) =>
        sortComparator(sortOrder.value, a.mimeType.toLowerCase(), b.mimeType.toLowerCase())
      );
      break;
    case SORT_TYPES.CREATED_BY:
      tempDocuments = tempDocuments.sort((a, b) =>
        sortComparator(sortOrder.value, a.createdByFullName.toLowerCase(), b.createdByFullName.toLowerCase())
      );
      break;
  }
  return tempDocuments;
});
</script>

<template>
  <BackButton
    :route-name="RouteName.HOUSING_SUBMISSIONS"
    text="Back to Submissions"
  />

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
      <div class="mb-3 border-dashed file-upload border-round-md">
        <FileUpload :activity-id="props.activityId" />
      </div>
      <div class="flex flex-row justify-content-between pb-3">
        <div class="flex align-items-center">
          <IconField icon-position="left">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchTag"
              placeholder="Search"
            />
          </IconField>
        </div>
        <div class="align-items-end">
          <Button
            aria-label="List"
            class="view-switch-button"
            @click="gridView = false"
          >
            <font-awesome-icon
              icon="fa-solid fa-list"
              class="fa-lg"
              :class="gridView ? 'list-grid-deselected-icon' : 'list-grid-selected-icon'"
            />
          </Button>
          <Button
            aria-label="Grid"
            class="view-switch-button"
            @click="gridView = true"
          >
            <font-awesome-icon
              icon="fa-solid fa-grip"
              class="fa-lg"
              :class="gridView ? 'list-grid-selected-icon' : 'list-grid-deselected-icon'"
            />
          </Button>
        </div>
      </div>
      <div
        v-if="gridView"
        class="grid nested-grid"
      >
        <DataTable
          v-if="gridView"
          class="remove-padding ml-2 mr-2 w-full"
          :sort-field="SORT_TYPES.CREATED_AT"
          :sort-order="SORT_ORDER.DESCENDING"
          @update:sort-order="
            (order: number) => {
              sortOrder = order;
            }
          "
          @update:sort-field="
            (field: string) => {
              sortType = field;
            }
          "
        >
          <template #empty>
            <div class="flex justify-content-center" />
          </template>
          <Column
            sortable
            field="filename"
            header="File name"
            class="w-9rem"
          />
          <Column
            field="createdAt"
            sortable
            header="Upload date"
            class="w-10rem"
          />
          <Column
            field="filesize"
            sortable
            header="Size"
            class="w-6rem"
          />
          <Column
            field="mimeType"
            sortable
            header="Type"
            class="w-10rem"
          />
          <Column />
        </DataTable>

        <div class="col-12">
          <div class="grid">
            <div
              v-for="(document, index) in filteredDocuments"
              :key="document.documentId"
              :index="index"
              class="col-12 md:col-6 lg:col-4 xl:col-2"
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
      <DataTable
        v-if="!gridView"
        :value="filteredDocuments"
        :sort-field="SORT_TYPES.CREATED_AT"
        :sort-order="SORT_ORDER.DESCENDING"
        :row-hover="true"
      >
        <Column
          field="filename"
          header="File name"
          sortable
        >
          <template #body="{ data }">
            <a
              href="#"
              @click="documentService.downloadDocument(data.documentId, data.filename)"
            >
              {{ data.filename }}
            </a>
          </template>
        </Column>
        <Column
          field="createdAt"
          header="Upload date"
          sortable
        >
          <template #body="{ data }">
            {{ formatDateLong(data.createdAt) }}
          </template>
        </Column>
        <Column
          field="filesize"
          header="Size"
          sortable
        >
          <template #body="{ data }">
            {{ filesize(data.filesize) }}
          </template>
        </Column>
        <Column
          field="mimeType"
          header="Type"
          sortable
        />
        <Column
          field="createdByFullName"
          header="Uploaded by"
          sortable
        />
        <Column field="fileAction">
          <template #header>
            <div class="flex justify-content-center w-full">
              <b>Action</b>
            </div>
          </template>
          <template #body="{ data }">
            <div class="flex justify-content-center">
              <DeleteDocument :document="data" />
            </div>
          </template>
        </Column>
      </DataTable>
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

:deep(.remove-padding.p-datatable .p-datatable-tbody > tr > td) {
  display: none;
}

.p-button.p-component.view-switch-button {
  background-color: transparent;
  border: none;
  padding-left: 0;
}

.list-grid-selected-icon {
  color: $app-primary;
}

.list-grid-deselected-icon {
  color: $app-out-of-focus;
  &:hover {
    color: $app-hover;
  }
}

.p-inputtext.p-component {
  width: 20rem;
}

.file-upload {
  color: $app-out-of-focus;
  &:hover {
    color: $app-hover;
  }
}
</style>
