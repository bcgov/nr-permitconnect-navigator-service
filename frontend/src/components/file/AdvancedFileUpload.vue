<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { Button, FileUpload, ProgressBar, useToast } from '@/lib/primevue';
import DocumentCardLite from '@/components/file/DocumentCardLite.vue';
import { documentService } from '@/services';
import { useConfigStore, useSubmissionStore } from '@/store';

import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import type { Ref } from 'vue';

// Props
const {
  activityId = undefined,
  accept = undefined,
  disabled = false,
  reject = undefined,
  generateActivityId
} = defineProps<{
  activityId?: string;
  accept?: string[];
  reject?: string[];
  disabled?: boolean;
  generateActivityId: () => Promise<string | undefined>;
}>();

// Store
const { getConfig } = storeToRefs(useConfigStore());
const submissionStore = useSubmissionStore();

// State
// const curActivityId: Ref<string | undefined> = ref(undefined);
const fileInput: Ref<any> = ref(null);
const uploading: Ref<Boolean> = ref(false);

// Actions
const toast = useToast();

const onFileUploadClick = () => {
  if (disabled) {
    toast.info('Document uploading is currently disabled');
    return;
  }

  fileInput.value.click();
};

const onFileUploadDragAndDrop = (event: FileUploadUploaderEvent) => {
  if (disabled) {
    toast.info('Document uploading is currently disabled');
    return;
  }

  onUpload(Array.isArray(event.files) ? event.files : [event.files]);
};

const onUpload = async (files: Array<File>) => {
  uploading.value = true;
  let currentActivityId: string | undefined = activityId;

  currentActivityId = activityId ? activityId : await generateActivityId();

  await Promise.allSettled(
    files.map((file: File) => {
      return new Promise((resolve, reject) => {
        if (currentActivityId) {
          documentService
            .createDocument(file, currentActivityId, getConfig.value.coms.bucketId)
            .then((response) => {
              if (response?.data) {
                submissionStore.addDocument(response.data);
                toast.success('Document uploaded');
              }
              return resolve(response);
            })
            .catch((e: any) => {
              toast.error('Failed to upload document', e);
              return reject(e);
            });
        } else return reject('No activityId');
      });
    })
  );

  uploading.value = false;
};

// Filter documents based on accept and reject props
// If accept and reject are not provided, all documents are shown
// If accept is provided, only documents with extensions in accept are shown
// If reject is provided, only documents with extensions not in reject are shown
const filteredDocuments = computed(() => {
  let documents = submissionStore.getDocuments;
  return documents.filter(
    (document) =>
      (!accept && !reject) ||
      accept?.some((ext) => document.filename.endsWith(ext)) ||
      reject?.every((ext) => !document.filename.endsWith(ext)) ||
      document.filename.endsWith('.pdf')
  );
});
</script>

<template>
  <div class="mb-4 border-dashed file-upload rounded-md w-100">
    <div>
      <div
        v-if="uploading"
        class="h-16 content-center pl-2 pr-2"
      >
        <ProgressBar
          mode="indeterminate"
          class="self-center progress-bar"
        />
      </div>
      <div
        v-if="!uploading"
        class="hover-hand hover-shadow"
      >
        <FileUpload
          name="fileUpload"
          :multiple="true"
          :custom-upload="true"
          :auto="true"
          :disabled="disabled"
          @uploader="onFileUploadDragAndDrop"
        >
          <template #empty>
            <div class="flex items-center justify-center flex-col">
              <Button
                aria-label="Upload"
                class="justify-center w-full h-16 border-0"
                @click="onFileUploadClick"
              >
                <font-awesome-icon
                  class="pr-2"
                  icon="fa-solid fa-upload"
                />
                Click or drag-and-drop
              </Button>
            </div>
          </template>
        </FileUpload>

        <input
          ref="fileInput"
          type="file"
          class="hidden"
          :accept="accept ? accept.join(',') : '*'"
          multiple
          @change="(event: any) => onUpload(Array.from(event.target.files))"
          @click="(event: any) => (event.target.value = null)"
        />
      </div>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-4 w-full">
    <div
      v-for="(document, index) in filteredDocuments"
      :key="document.documentId"
      :index="index"
      class="col-span-4"
    >
      <DocumentCardLite
        :document="document"
        :delete-button="!disabled"
        class="hover-hand hover-shadow mb-2"
        @click="documentService.downloadDocument(document.documentId, document.filename)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-fileupload-header) {
  display: none;
}

:deep(.p-fileupload-content) {
  padding: 0;
  border: none;

  .p-button {
    padding: 0;
    border: none;
  }
}

.file-input {
  display: none;
}

.p-button.p-component {
  background-color: transparent;
  color: var(--text-color);
}

.progress-bar {
  height: 0.3rem;
}

.file-upload {
  width: 100%;
  color: var(--p-greyscale-500);
  &:hover {
    color: var(--p-content-hover-background);
  }
}
</style>
