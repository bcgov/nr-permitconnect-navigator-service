<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { filesize } from 'filesize';
import { computed, ref } from 'vue';

import DeleteDocument from '@/components/file/DeleteDocument.vue';
import DocumentCard from '@/components/file/DocumentCard.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import { Button, Column, DataTable, IconField, InputIcon, InputText } from '@/lib/primevue';
import { documentService } from '@/services';
import { useAppStore, useAuthZStore, useProjectStore } from '@/store';
import { Action, Resource } from '@/utils/enums/application';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';

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

// Store
const { getInitiative } = storeToRefs(useAppStore());
const projectStore = useProjectStore();
const { getDocuments, getProject, getProjectIsCompleted } = storeToRefs(projectStore);

// State
const gridView: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const sortOrder: Ref<number | undefined> = ref(Number(SORT_ORDER.DESCENDING));
const sortType: Ref<string> = ref(SORT_TYPES.CREATED_AT);

// Actions
function sortComparator(sortValue: number | undefined, a: string | number, b: string | number) {
  if (sortValue === SORT_ORDER.ASCENDING) return a > b ? 1 : -1;
  else return a < b ? 1 : -1;
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
  <div>
    <div class="mb-4 border-dashed file-upload rounded-md">
      <FileUpload
        v-if="getProject?.activityId"
        :activity-id="getProject.activityId"
        :disabled="getProjectIsCompleted || !useAuthZStore().can(getInitiative, Resource.DOCUMENT, Action.CREATE)"
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
              :editable="!getProjectIsCompleted"
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
                if (useAuthZStore().can(getInitiative, Resource.DOCUMENT, Action.READ))
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
              :disabled="getProjectIsCompleted || !useAuthZStore().can(getInitiative, Resource.DOCUMENT, Action.DELETE)"
              :document="data"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
.list-grid-selected-icon {
  color: var(--p-primary-color);
}

.list-grid-deselected-icon {
  color: var(--p-content-hover-background);
  &:hover {
    color: var(--primary-hover-color);
  }
}

:deep(.remove-padding.p-datatable .p-datatable-tbody > tr > td) {
  display: none;
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

.p-button.p-component.view-switch-button {
  background-color: transparent;
  border: none;
  padding-left: 0;
}
</style>
