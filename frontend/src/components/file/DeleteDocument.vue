<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Button, useConfirm, useToast } from '@/lib/primevue';
import { documentService } from '@/services';
import { useProjectStore } from '@/store';

import type { Document } from '@/types';

// Props
const { document, disabled = false } = defineProps<{
  document: Document;
  disabled?: boolean;
}>();

// Store
const projectStore = useProjectStore();

// Actions
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const confirmDelete = () => {
  if (document) {
    confirm.require({
      message: `Please confirm that you want to delete ${document.filename}.`,
      header: 'Delete document?',
      acceptLabel: 'Confirm',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectProps: { outlined: true },
      accept: () => {
        documentService
          .deleteDocument(document.documentId)
          .then(() => {
            projectStore.removeDocument(document);
            toast.success('Document deleted');
          })
          .catch((e) => toast.error('Failed to deleted document', e.message));
      }
    });
  }
};
</script>

<template>
  <span v-tooltip.bottom="t('deleteDocument.deleteTooltip')">
    <span v-tooltip.focus.bottom="t('deleteDocument.deleteTooltip')">
      <Button
        :disabled="disabled"
        class="p-button-lg p-button-text p-button-danger p-0 self-center"
        aria-label="Delete object"
        style="position: relative; top: 5; right: 0"
        tabindex="0"
        @click="
          (e) => {
            confirmDelete();
            e.stopPropagation();
          }
        "
      >
        <font-awesome-icon icon="fa-solid fa-trash" />
      </Button>
    </span>
  </span>
</template>
