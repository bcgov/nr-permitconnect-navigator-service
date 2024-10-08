<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { Button, FileUpload, ProgressBar, useToast } from '@/lib/primevue';
import { documentService } from '@/services';
import { useConfigStore, useSubmissionStore } from '@/store';

import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import type { Ref } from 'vue';

// Props
const { activityId, disabled = false } = defineProps<{
  activityId: string;
  disabled?: boolean;
}>();

// Store
const { getConfig } = storeToRefs(useConfigStore());
const submissionStore = useSubmissionStore();

// State
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
  await Promise.allSettled(
    files.map(async (file: File) => {
      try {
        uploading.value = true;
        const response = (await documentService.createDocument(file, activityId, getConfig.value.coms.bucketId))?.data;

        if (response) {
          submissionStore.addDocument(response);
          toast.success('Document uploaded');
        }
      } catch (e: any) {
        toast.error('Failed to upload document', e);
      } finally {
        uploading.value = false;
      }
    })
  );
};
</script>

<template>
  <div>
    <div
      v-if="uploading"
      class="h-4rem align-content-center pl-2 pr-2"
    >
      <ProgressBar
        mode="indeterminate"
        class="align-self-center progress-bar"
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
          <div class="flex align-items-center justify-content-center flex-column">
            <Button
              aria-label="Upload"
              class="justify-content-center w-full h-4rem border-none"
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
        <template #content="{ files }">
          <div
            v-if="files.length > 0"
            class="flex align-items-center justify-content-center flex-column"
          >
            <font-awesome-icon
              icon="fa-solid fa-upload"
              class="border-2 border-dashed border-circle p-5 text-7xl text-400 border-400"
            />
            <p class="font-bold">Upload</p>
            <p>Click or drag-and-drop</p>
          </div>
        </template>
      </FileUpload>
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        accept="*"
        multiple
        @change="(event: any) => onUpload(Array.from(event.target.files))"
        @click="(event: any) => (event.target.value = null)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-fileupload-buttonbar) {
  display: none;
}
:deep(.p-fileupload-content) {
  padding: 0;
  border: none;
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
</style>
