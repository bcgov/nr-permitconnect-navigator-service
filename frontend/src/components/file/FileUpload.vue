<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { FileUpload, useToast } from '@/lib/primevue';
import { documentService } from '@/services';
import { useConfigStore, useSubmissionStore } from '@/store';

import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import type { Ref } from 'vue';

// Props
type Props = {
  activityId: string;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), { disabled: false });

// Store
const { getConfig } = storeToRefs(useConfigStore());
const submissionStore = useSubmissionStore();

// State
const fileInput: Ref<any> = ref(null);

// Actions
const toast = useToast();

const onFileUploadClick = () => {
  if (props.disabled) {
    toast.info('Document uploading is currently disabled');
    return;
  }

  fileInput.value.click();
};

const onFileUploadDragAndDrop = (event: FileUploadUploaderEvent) => {
  if (props.disabled) {
    toast.info('Document uploading is currently disabled');
    return;
  }

  onUpload(Array.isArray(event.files) ? event.files[0] : event.files);
};

const onUpload = async (file: File) => {
  try {
    const response = (await documentService.createDocument(file, props.activityId, getConfig.value.coms.bucketId))
      ?.data;

    if (response) {
      submissionStore.addDocument(response);
      toast.success('Document uploaded');
    }
  } catch (e: any) {
    toast.error('Failed to upload document', e);
  }
};
</script>

<template>
  <div class="hover-hand hover-shadow">
    <FileUpload
      name="fileUpload"
      :multiple="false"
      :custom-upload="true"
      :auto="true"
      :disabled="props.disabled"
      @uploader="onFileUploadDragAndDrop"
      @click="onFileUploadClick"
    >
      <template #empty>
        <div class="flex align-items-center justify-content-center flex-column">
          <font-awesome-icon
            icon="fa-solid fa-upload"
            class="border-2 border-dashed border-circle p-5 text-7xl text-400 border-400"
          />
          <p class="font-bold">Upload</p>
          <p>Click or drag-and-drop</p>
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
      style="display: none"
      accept="*"
      @change="(event: any) => onUpload(event.target.files[0])"
      @click="(event: any) => (event.target.value = null)"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.p-fileupload-buttonbar) {
  display: none;
}

:deep(.p-fileupload-content) {
  padding: 1rem;
  border-style: dashed;
}
</style>
