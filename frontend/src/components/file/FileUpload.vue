<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { FileUpload } from '@/lib/primevue';
import { documentService } from '@/services';
import { useConfigStore } from '@/store';

import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import type { Ref } from 'vue';

// Props
type Props = {
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

const lastUploadedDocument = defineModel();

// Store
const { getConfig } = storeToRefs(useConfigStore());

// State
const fileInput: Ref<any> = ref(null);

// Actions
const onFileUploadDragAndDrop = (event: FileUploadUploaderEvent) => {
  onUpload(Array.isArray(event.files) ? event.files[0] : event.files);
};

const onFileUploadClick = () => {
  fileInput.value.click();
};

const onUpload = async (file: File) => {
  lastUploadedDocument.value = (
    await documentService.createDocument(file, props.submissionId, getConfig.value.coms.bucketId)
  )?.data;
};
</script>

<template>
  <FileUpload
    name="fileUpload"
    :multiple="false"
    :custom-upload="true"
    :auto="true"
    @uploader="onFileUploadDragAndDrop"
    @click="onFileUploadClick"
  >
    <template #empty>
      <div class="flex align-items-center justify-content-center flex-column mb-3">
        <font-awesome-icon
          icon="fa-solid fa-upload"
          class="border-2 border-dashed border-circle p-5 text-7xl text-400 border-400"
        />
        <p class="font-bold">Upload</p>
        <p class="mt-2 mb-0">Click or drag-and-drop</p>
      </div>
    </template>
    <template #content="{ files }">
      <div
        v-if="files.length > 0"
        class="flex align-items-center justify-content-center flex-column mb-3"
      >
        <font-awesome-icon
          icon="fa-solid fa-upload"
          class="border-2 border-dashed border-circle p-5 text-7xl text-400 border-400"
        />
        <p class="font-bold">Upload</p>
        <p class="mb-0">Click or drag-and-drop</p>
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
</template>

<style lang="scss">
.p-fileupload-buttonbar {
  display: none;
}

.p-fileupload-content {
  padding-bottom: 0px;
}
</style>
