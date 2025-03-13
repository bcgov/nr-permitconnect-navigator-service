<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { Button, FileUpload, ProgressBar, useToast } from '@/lib/primevue';
import { documentService } from '@/services';
import { useConfigStore, useHousingProjectStore } from '@/store';
import { getFilenameAndExtension } from '@/utils/utils';

import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import type { Ref } from 'vue';

// Props
const { activityId, disabled = false } = defineProps<{
  activityId: string;
  disabled?: boolean;
}>();

// Store
const { getConfig } = storeToRefs(useConfigStore());
const housingProjectStore = useHousingProjectStore();

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
      const sanitizedFile = new File([file], encodeURI(file.name), { type: file.type });
      try {
        uploading.value = true;
        const response = (
          await documentService.createDocument(sanitizedFile, activityId, getConfig.value.coms.bucketId)
        )?.data;

        if (response) {
          response.extension = getFilenameAndExtension(response.filename).extension;
          response.filename = decodeURI(response.filename);
          housingProjectStore.addDocument(response);
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
  <div class="mb-4 border-2 border-dashed file-upload rounded-md w-full">
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
        class="border-0"
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
        <template #content="{ files }">
          <div
            v-if="files.length > 0"
            class="flex items-center justify-center flex-col"
          >
            <!-- eslint-disable max-len -->
            <font-awesome-icon
              icon="fa-solid fa-upload"
              class="border-2 border-dashed rounded-full p-8 text-7xl text-surface-400 dark:text-surface-400 border-surface-400 dark:border-surface-400"
            />
            <!-- eslint-enable max-len -->
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

.p-fileupload {
  border-style: none;
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
