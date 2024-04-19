<script setup lang="ts">
import { filesize } from 'filesize';
import { ref } from 'vue';

import { Button, Card, useConfirm, useToast } from '@/lib/primevue';
import { documentService } from '@/services';
import { useSubmissionStore } from '@/store';
import { FILE_CATEGORIES } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';
import { getFileCategory } from '@/utils/utils';

import compressed from '@/assets/images/compressed.svg';
import doc from '@/assets/images/doc.svg';
import email from '@/assets/images/email.svg';
import file from '@/assets/images/file.svg';
import image from '@/assets/images/image.svg';
import pdf from '@/assets/images/pdf.svg';
import shape from '@/assets/images/shape.svg';
import spreadsheet from '@/assets/images/spreadsheet.svg';

import type { Ref } from 'vue';
import type { Document } from '@/types';

// Props
type Props = {
  deleteButton?: boolean;
  document: Document;
  selectable?: boolean;
  selected?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  deleteButton: true,
  selectable: false,
  selected: false
});

// Emits
const emit = defineEmits(['document:clicked']);

// Store
const submissionStore = useSubmissionStore();

// State
const isSelected: Ref<boolean> = ref(props.selected);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmDelete = (document: Document) => {
  if (document) {
    confirm.require({
      message: `Please confirm that you want to delete ${document.filename}.`,
      header: 'Delete document?',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        documentService
          .deleteDocument(document.documentId)
          .then(() => {
            submissionStore.removeDocument(document);
            toast.success('Document deleted');
          })
          .catch((e: any) => toast.error('Failed to deleted document', e.message));
      }
    });
  }
};

const displayIcon = (mimeType = '') => {
  const icon = getFileCategory(mimeType);

  switch (icon) {
    case FILE_CATEGORIES.DOC:
      return doc;
    case FILE_CATEGORIES.SHAPE:
      return shape;
    case FILE_CATEGORIES.PDF:
      return pdf;
    case FILE_CATEGORIES.SPREADSHEET:
      return spreadsheet;
    case FILE_CATEGORIES.IMAGE:
      return image;
    case FILE_CATEGORIES.EMAIL:
      return email;
    case FILE_CATEGORIES.COMPRESSED:
      return compressed;
    default:
      return file;
  }
};

function onClick() {
  if (props.selectable) {
    isSelected.value = !isSelected.value;
    emit('document:clicked', { document: props.document, selected: isSelected.value });
  }
}
</script>

<template>
  <Card
    class="pb-1 text-center"
    :class="{ clicked: isSelected }"
    @click="onClick"
  >
    <template #header>
      <img
        alt="document header"
        :src="displayIcon(props.document.mimeType)"
        class="document-image"
      />
    </template>
    <template #content>
      <div class="grid">
        <div
          v-tooltip.bottom="props.document.filename"
          class="col-12 mb-0 text-left font-semibold text-overflow-ellipsis white-space-nowrap"
          style="overflow: hidden"
        >
          {{ props.document.filename }}
        </div>
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
            confirmDelete(props.document);
            e.stopPropagation();
          }
        "
      >
        <font-awesome-icon icon="fa-solid fa-trash" />
      </Button>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.document-image {
  max-height: 2.5rem;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.clicked {
  box-shadow: 0 0 11px #036;
}

:deep(.p-card-header) {
  height: 5rem;
  background-color: lightgray;
}

:deep(.p-card-content) {
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.p-card-footer) {
  padding: 0;
  text-align: right;
}
</style>
