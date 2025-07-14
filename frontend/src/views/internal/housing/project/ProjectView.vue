<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { filesize } from 'filesize';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthorizationCard from '@/components/authorization/AuthorizationCard.vue';
import AuthorizationCardLite from '@/components/authorization/AuthorizationCardLite.vue';
import DeleteDocument from '@/components/file/DeleteDocument.vue';
import DocumentCard from '@/components/file/DocumentCard.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import NoteHistoryModal from '@/components/note/NoteHistoryModal.vue';
import EnquiryCard from '@/components/projectCommon/enquiry/EnquiryCard.vue';
import Roadmap from '@/components/roadmap/Roadmap.vue';
import SubmissionForm from '@/components/housing/submission/SubmissionForm.vue';
import {
  Button,
  Column,
  DataTable,
  IconField,
  InputIcon,
  InputText,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels
} from '@/lib/primevue';
import {
  documentService,
  enquiryService,
  housingProjectService,
  noteHistoryService,
  permitService,
  userService
} from '@/services';
import { useAuthZStore, usePermitStore, useProjectStore } from '@/store';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { formatDateLong } from '@/utils/formatters';
import { projectServiceKey } from '@/utils/keys';
import { getFilenameAndExtension } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Document, Enquiry, HousingProject, NoteHistory, User } from '@/types';

// Props
const { initialTab = '0', projectId } = defineProps<{
  initialTab?: string;
  projectId: string;
}>();

// Constants
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

// Composables
const { t } = useI18n();
const router = useRouter();

// Store
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const { getPermitTypes } = storeToRefs(permitStore);
const {
  getAuthsCompleted,
  getAuthsNeeded,
  getAuthsNotNeeded,
  getAuthsOnGoing,
  getAuthsUnderInvestigation,
  getDocuments,
  getProject,
  getNoteHistory,
  getPermits,
  getRelatedEnquiries
} = storeToRefs(projectStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const activityId: Ref<string | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteModalVisible: Ref<boolean> = ref(false);
const noteHistoryCreatedByFullnames: Ref<{ noteHistoryId: string; createdByFullname: string }[]> = ref([]);
const permitModalVisible: Ref<boolean> = ref(false);
const gridView: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const sortOrder: Ref<number | undefined> = ref(Number(SORT_ORDER.DESCENDING));
const sortType: Ref<string> = ref(SORT_TYPES.CREATED_AT);

// Providers
provide(projectServiceKey, housingProjectService);

// Actions
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

const isCompleted = computed(() => {
  return getProject.value?.applicationStatus === ApplicationStatus.COMPLETED;
});

function onCreateNoteHistory(history: NoteHistory) {
  projectStore.addNoteHistory(history, true);
}

function onDeleteNoteHistory(history: NoteHistory) {
  projectStore.removeNoteHistory(history);
}

function onUpdateNoteHistory(history: NoteHistory) {
  projectStore.updateNoteHistory(history);
}

function sortComparator(sortValue: number | undefined, a: any, b: any) {
  return sortValue === SORT_ORDER.ASCENDING ? (a > b ? 1 : -1) : a < b ? 1 : -1;
}

function toAuthorization(authId: string) {
  router.push({
    name: RouteName.INT_HOUSING_PROJECT_AUTHORIZATION,
    params: {
      permitId: authId,
      projectId: projectId
    }
  });
}

onBeforeMount(async () => {
  const project = (await housingProjectService.getProject(projectId)).data;
  activityId.value = project.activityId;
  const [documents, notes, permits, relatedEnquiries] = (
    await Promise.all([
      documentService.listDocuments(project.activityId),
      noteHistoryService.listNoteHistories(project.activityId),
      permitService.listPermits({ activityId: project.activityId, includeNotes: true }),
      enquiryService.listRelatedEnquiries(project.activityId)
    ])
  ).map((r) => r.data);

  project.relatedEnquiries = relatedEnquiries.map((x: Enquiry) => x.activityId).join(', ');
  documents.forEach((d: Document) => {
    d.extension = getFilenameAndExtension(d.filename).extension;
    d.filename = decodeURI(d.filename);
  });

  projectStore.setProject(project);
  projectStore.setDocuments(documents);
  projectStore.setNoteHistory(notes);
  projectStore.setPermits(permits);
  projectStore.setRelatedEnquiries(relatedEnquiries);

  if (getPermitTypes.value.length === 0) {
    const permitTypes = (await permitService.getPermitTypes(Initiative.HOUSING)).data;
    permitStore.setPermitTypes(permitTypes);
  }

  // Batch lookup the users who have created notes
  const noteHistoryCreatedByUsers = getNoteHistory.value.map((x) => ({
    noteHistoryId: x.noteHistoryId,
    createdBy: x.createdBy
  }));

  if (noteHistoryCreatedByUsers.length) {
    const noteHistoryUsers = await userService.searchUsers({
      userId: noteHistoryCreatedByUsers.map((x) => x.createdBy).filter((x) => x !== undefined)
    });

    noteHistoryCreatedByFullnames.value = noteHistoryCreatedByUsers.map((x) => ({
      noteHistoryId: x.noteHistoryId as string,
      createdByFullname: noteHistoryUsers.data.find((user: User) => user.userId === x.createdBy).fullName
    }));
  }

  loading.value = false;
});
</script>

<template>
  <div class="flex items-center justify-between">
    <h1>
      <span v-if="getProject?.projectName">
        <span class="ml-1">{{ getProject.projectName + ': ' }}</span>
      </span>
      <span
        v-if="getProject?.activityId"
        class="mr-1"
      >
        {{ getProject.activityId }}
      </span>
      <span
        v-if="isCompleted"
        class="ml-0"
      >
        (Completed)
      </span>
    </h1>
    <Button
      outlined
      @click="
        router.push({
          name: RouteName.INT_HOUSING_PROJECT_PROPONENT,
          params: {
            projectId: projectId
          }
        })
      "
    >
      <font-awesome-icon icon="fa-solid fa-eye" />
      {{ t('i.common.projectView.seePropViewButtonLabel') }}
    </Button>
  </div>

  <Tabs :value="activeTab">
    <TabList>
      <Tab :value="0">{{ t('i.common.projectView.tabInformation') }}</Tab>
      <Tab :value="1">{{ t('i.common.projectView.tabFiles') }}</Tab>
      <Tab :value="2">{{ t('i.common.projectView.tabAuthorizations') }}</Tab>
      <Tab :value="3">{{ t('i.common.projectView.tabNotes') }}</Tab>
      <Tab :value="4">{{ t('i.common.projectView.tabRoadmap') }}</Tab>
      <Tab :value="5">{{ t('i.common.projectView.tabRelatedEnquiries') }}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <span v-if="!loading && getProject">
          <SubmissionForm
            :editable="!isCompleted && useAuthZStore().can(Initiative.HOUSING, Resource.HOUSING_PROJECT, Action.UPDATE)"
            :housing-project="getProject as HousingProject"
          />
        </span>
      </TabPanel>
      <TabPanel :value="1">
        <div class="mb-4 border-dashed file-upload rounded-md">
          <FileUpload
            v-if="activityId"
            :activity-id="activityId"
            :disabled="isCompleted || !useAuthZStore().can(Initiative.HOUSING, Resource.DOCUMENT, Action.CREATE)"
          />
        </div>
        <div class="flex flex-row justify-between pb-4">
          <div class="flex items-center">
            <IconField icon-position="left">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchTag"
                placeholder="Search"
              />
            </IconField>
          </div>
          <div class="items-end">
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
          class="grid grid-cols-12 gap-4 nested-grid"
        >
          <DataTable
            v-if="gridView"
            class="remove-padding col-span-12"
            removable-sort
            :sort-field="SORT_TYPES.CREATED_AT"
            :sort-order="SORT_ORDER.DESCENDING"
            @update:sort-order="
              (order: number | undefined) => {
                sortOrder = order ?? SORT_ORDER.DESCENDING;
              }
            "
            @update:sort-field="
              (field: string) => {
                sortType = field;
              }
            "
          >
            <template #empty>
              <div class="flex justify-center" />
            </template>
            <Column
              sortable
              field="filename"
              header="File name"
              class="w-36"
            />
            <Column
              field="createdAt"
              sortable
              header="Upload date"
              class="w-40"
            />
            <Column
              field="filesize"
              sortable
              header="Size"
              class="w-24"
            />
            <Column
              field="mimeType"
              sortable
              header="Type"
              class="w-40"
            />
            <Column />
          </DataTable>

          <div class="col-span-12">
            <div class="grid grid-cols-6 gap-4">
              <div
                v-for="(document, index) in filteredDocuments"
                :key="document.documentId"
                :index="index"
                class="col-span-1"
              >
                <DocumentCard
                  :document="document"
                  :editable="!isCompleted"
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
          removable-sort
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
                @click="
                  () => {
                    if (useAuthZStore().can(Initiative.HOUSING, Resource.DOCUMENT, Action.READ))
                      documentService.downloadDocument(data.documentId, data.filename);
                  }
                "
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
            field="extension"
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
              <div class="flex justify-center w-full">
                <b>Action</b>
              </div>
            </template>
            <template #body="{ data }">
              <div class="flex justify-center">
                <DeleteDocument
                  :disabled="isCompleted || !useAuthZStore().can(Initiative.HOUSING, Resource.DOCUMENT, Action.DELETE)"
                  :document="data"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
      <TabPanel :value="2">
        <div class="flex items-center pb-5">
          <div class="grow">
            <p class="font-bold">{{ t('i.common.projectView.applicableAuthorizations') }} ({{ getPermits.length }})</p>
          </div>
          <Button
            aria-label="Add authorization"
            :disabled="isCompleted || !useAuthZStore().can(Initiative.HOUSING, Resource.PERMIT, Action.CREATE)"
            @click="
              router.push({
                name: RouteName.INT_HOUSING_PROJECT_ADD_AUTHORIZATION,
                params: {
                  projectId: projectId
                }
              })
            "
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-plus"
            />
            {{ t('i.common.projectView.addAuthorization') }}
          </Button>
        </div>
        <!-- On going Authorizations -->
        <div
          v-for="(permit, index) in getAuthsOnGoing"
          :key="permit.permitId"
          :index="index"
          class="mb-6 mt-6"
        >
          <AuthorizationCard
            :editable="!isCompleted"
            :permit="permit"
            @authorization-card:more="toAuthorization(permit.permitId)"
          />
        </div>
        <!-- Authorizations with needed = under investigation -->
        <div
          v-if="getAuthsUnderInvestigation.length > 0"
          class="mb-8 mt-16"
        >
          <h4 class="mb-6">{{ t('i.common.projectView.underInvestigation') }}</h4>
          <div
            v-for="(permit, index) in getAuthsUnderInvestigation"
            :key="permit.permitId"
            :index="index"
            class="my-2"
          >
            <AuthorizationCardLite
              :editable="!isCompleted"
              :permit="permit"
              @authorization-card-lite:more="toAuthorization(permit.permitId)"
            />
          </div>
        </div>
        <!-- Authorizations with needed = Yes & stage = Pre-submission -->
        <div
          v-if="getAuthsNeeded.length > 0"
          class="mb-8 mt-16"
        >
          <h4 class="mb-6">{{ t('i.common.projectView.needed') }}</h4>
          <div
            v-for="(permit, index) in getAuthsNeeded"
            :key="permit.permitId"
            :index="index"
            class="my-2"
          >
            <AuthorizationCardLite
              :editable="!isCompleted"
              :permit="permit"
              @authorization-card-lite:more="toAuthorization(permit.permitId)"
            />
          </div>
        </div>
        <!--Authorizations when its Status=Approved, Denied, Cancelled, Withdrawn OR Abandoned.-->
        <div
          v-if="getAuthsCompleted.length > 0"
          class="mb-8 mt-16"
        >
          <h4 class="mb-6">{{ t('i.common.projectView.completed') }}</h4>
          <div
            v-for="(permit, index) in getAuthsCompleted"
            :key="permit.permitId"
            :index="index"
            class="my-2"
          >
            <AuthorizationCard
              :editable="!isCompleted"
              :permit="permit"
              @authorization-card:more="toAuthorization(permit.permitId)"
            />
          </div>
        </div>
        <!--Authorizations when needed = NO-->
        <div
          v-if="getAuthsNotNeeded.length > 0"
          class="mb-8 mt-16"
        >
          <h4 class="mb-6">{{ t('i.common.projectView.notNeeded') }}</h4>
          <div
            v-for="(permit, index) in getAuthsNotNeeded"
            :key="permit.permitId"
            :index="index"
            class="my-2"
          >
            <AuthorizationCardLite
              :editable="!isCompleted"
              :permit="permit"
              @authorization-card-lite:more="toAuthorization(permit.permitId)"
            />
          </div>
        </div>
      </TabPanel>
      <TabPanel :value="3">
        <div class="flex items-center pb-5">
          <div class="grow">
            <p class="font-bold">Notes ({{ getNoteHistory.length }})</p>
          </div>
          <Button
            aria-label="Add note"
            :disabled="isCompleted || !useAuthZStore().can(Initiative.HOUSING, Resource.NOTE, Action.CREATE)"
            @click="noteModalVisible = true"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-plus"
            />
            Add note
          </Button>
        </div>
        <div v-if="!loading">
          <div
            v-for="(noteHistory, index) in getNoteHistory"
            :key="noteHistory.noteHistoryId"
            :index="index"
            class="mb-6"
          >
            <NoteHistoryCard
              :editable="!isCompleted"
              :note-history="noteHistory"
              :created-by-full-name="
                noteHistoryCreatedByFullnames.find((x) => x.noteHistoryId === noteHistory.noteHistoryId)
                  ?.createdByFullname
              "
              @delete-note-history="(e) => projectStore.removeNoteHistory(e)"
              @update-note-history="(e) => projectStore.updateNoteHistory(e)"
            />
          </div>
        </div>

        <NoteHistoryModal
          v-if="noteModalVisible && activityId"
          v-model:visible="noteModalVisible"
          :activity-id="activityId"
          @create-note-history="onCreateNoteHistory"
        />
      </TabPanel>
      <TabPanel :value="4">
        <Roadmap
          v-if="!loading && activityId"
          :activity-id="activityId"
          :editable="!isCompleted && useAuthZStore().can(Initiative.HOUSING, Resource.ROADMAP, Action.CREATE)"
        />
      </TabPanel>
      <TabPanel :value="5">
        <div class="flex items-center pb-2">
          <div class="grow">
            <p class="font-bold">
              {{ t('i.common.projectView.tabRelatedEnquiries') }} ({{ getRelatedEnquiries.length }})
            </p>
          </div>
        </div>
        <div
          v-for="(enquiry, index) in getRelatedEnquiries"
          :key="enquiry.enquiryId"
          :index="index"
          class="col-span-12 mb-6"
        >
          <EnquiryCard :enquiry="enquiry" />
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
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
  color: var(--p-primary-color);
}

.list-grid-deselected-icon {
  color: var(--p-content-hover-background);
  &:hover {
    color: var(--primary-hover-color);
  }
}

.p-inputtext.p-component {
  width: 20rem;
}

.file-upload {
  color: var(--p-greyscale-500);
  &:hover {
    color: var(--p-content-hover-background);
  }
}
</style>
