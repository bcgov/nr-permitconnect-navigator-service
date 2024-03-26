<script setup lang="ts">
import { ref } from 'vue';
import DocumentCard from '@/components/file/DocumentCard.vue';
import { Button, Dialog } from '@/lib/primevue';

import type { Ref } from 'vue';
import type { Document } from '@/types';

// Props
type Props = {
  documents: Array<Document>;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['fileSelect:submit']);

// State
const selectedFiles: Ref<Array<Document>> = ref([]);
const visible = defineModel<boolean>('visible');

// Actions
function onDocumentClicked(data: any) {
  if (data.selected) {
    if (!selectedFiles.value.find((x) => x === data.document.documentId)) selectedFiles.value.push(data.document);
  } else {
    selectedFiles.value = selectedFiles.value.filter((x) => x.documentId !== data.document.documentId);
  }
}

function onSave() {
  emit('fileSelect:submit', selectedFiles.value);
  selectedFiles.value = [];
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6"
  >
    <template #header>
      <span class="p-dialog-title">Select files</span>
    </template>
    <div class="col-12">
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
            :delete-button="false"
            :selectable="true"
            :selected="selectedFiles.includes(document)"
            @document:clicked="onDocumentClicked"
          />
        </div>
      </div>
      <div class="field col-12 flex">
        <div class="flex-auto">
          <Button
            class="mr-2"
            label="Save"
            icon="pi pi-check"
            @click="onSave"
          />
          <Button
            class="p-button-outlined mr-2"
            label="Cancel"
            icon="pi pi-times"
            @click="visible = false"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
