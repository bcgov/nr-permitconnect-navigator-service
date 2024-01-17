<script setup lang="ts">
import { filesize } from 'filesize';

import { Button, Card, useConfirm, useToast } from '@/lib/primevue';
import { documentService } from '@/services';
import { formatDateLong } from '@/utils/formatters';

import type { Document } from '@/types';

// Props
type Props = {
  document: Document;
  deleteButton?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  deleteButton: true
});

// Emits
const emit = defineEmits(['document:deleted']);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmDelete = (documentId: string, filename: string) => {
  if (documentId) {
    confirm.require({
      message: `Please confirm that you want to delete ${filename}.`,
      header: 'Delete document?',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        documentService
          .deleteDocument(documentId)
          .then(() => {
            emit('document:deleted', documentId);
            toast.success('File deleted');
          })
          .catch(() => {});
      }
    });
  }
};
</script>

<template>
  <Card class="pt-2 pb-1 text-center">
    <template #header>
      <img
        alt="document header"
        src="@/assets/images/bcboxy.png"
        class="document-image"
      />
    </template>
    <template #content>
      <div class="grid">
        <h4
          v-tooltip.bottom="props.document.filename"
          class="col-12 mb-0 text-left"
          style="text-overflow: ellipsis; overflow: hidden"
        >
          {{ props.document.filename }}
        </h4>
        <h6 class="col-8 text-left mt-0 mb-0">
          {{ formatDateLong(props.document.createdAt as string) }}
        </h6>
        <h6 class="col-4 text-right mt-0 mb-0">
          {{ filesize(props.document.filesize) }}
        </h6>
      </div>
    </template>
    <template #footer>
      <Button
        v-if="deleteButton"
        v-tooltip.bottom="'Delete document'"
        class="p-button-lg p-button-text p-button-danger p-0"
        aria-label="Delete object"
        @click="
          (e) => {
            confirmDelete(props.document.documentId, props.document.filename);
            e.stopPropagation();
          }
        "
      >
        <font-awesome-icon icon="fa-solid fa-trash" />
      </Button>
    </template>
  </Card>
</template>

<style lang="scss">
.document-image {
  max-height: 140px;
  width: auto;
  height: auto;
}

.p-card-content {
  padding-top: 0;
  padding-bottom: 0;
}

.p-card-footer {
  padding: 0;
  text-align: right;
}
</style>
