<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import DocumentCard from '@/components/file/DocumentCard.vue';
import { Button, Dialog } from '@/lib/primevue';

import type { Ref } from 'vue';
import type { Document } from '@/types';

// Props
const { documents, selectedDocuments = [] } = defineProps<{
  documents: Array<Document>;
  selectedDocuments?: Array<Document>;
}>();

// Emits
const emit = defineEmits(['fileSelect:submit']);

// State
const visible = defineModel<boolean>('visible');
const selectedFiles: Ref<Array<Document>> = ref(selectedDocuments);

// Actions
function onDocumentClicked(data: { document: Document; selected: boolean }) {
  if (data.selected) {
    if (!selectedFiles.value.includes(data.document)) {
      selectedFiles.value.push(data.document);
    }
  } else {
    selectedFiles.value = selectedFiles.value.filter((x) => x.documentId !== data.document.documentId);
  }
}

function onSave() {
  emit('fileSelect:submit', selectedFiles.value.slice());
  visible.value = false;
}

watchEffect(() => {
  selectedFiles.value = selectedDocuments;
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6/12"
  >
    <template #header>
      <span class="p-dialog-title">Select files</span>
    </template>
    <div class="col-span-12">
      <div class="grid grid-cols-12 gap-4">
        <div
          v-for="(document, index) in documents"
          :key="document.documentId"
          :index="index"
          class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
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
      <div class="field col-span-12 flex">
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
