<script setup lang="ts">
import { filesize } from 'filesize';
import { ref } from 'vue';

import compressed from '@/assets/images/compressed.svg';
import doc from '@/assets/images/doc.svg';
import email from '@/assets/images/email.svg';
import file from '@/assets/images/file.svg';
import image from '@/assets/images/image.svg';
import pdf from '@/assets/images/pdf.svg';
import shape from '@/assets/images/shape.svg';
import spreadsheet from '@/assets/images/spreadsheet.svg';

import DeleteDocument from '@/components/file/DeleteDocument.vue';
import { Card } from '@/lib/primevue';
import { FileCategory } from '@/utils/enums/application';
import { formatDateLong } from '@/utils/formatters';
import { getFileCategory } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Document } from '@/types';

// Props
const { selectable = false, selected = false } = defineProps<{
  document: Document;
  selectable?: boolean;
  selected?: boolean;
}>();

// Emits
const emit = defineEmits(['document:clicked']);

// State
const isSelected: Ref<boolean> = ref(selected);

// Actions
const displayIcon = (mimeType = '') => {
  const icon = getFileCategory(mimeType);

  switch (icon) {
    case FileCategory.DOC:
      return doc;
    case FileCategory.SHAPE:
      return shape;
    case FileCategory.PDF:
      return pdf;
    case FileCategory.SPREADSHEET:
      return spreadsheet;
    case FileCategory.IMAGE:
      return image;
    case FileCategory.EMAIL:
      return email;
    case FileCategory.COMPRESSED:
      return compressed;
    default:
      return file;
  }
};

function onClick() {
  if (selectable) {
    isSelected.value = !isSelected.value;
    emit('document:clicked', { document: document, selected: isSelected.value });
  }
}
</script>

<template>
  <Card
    class="pb-1 text-center border-round-xl"
    :class="{ clicked: isSelected }"
    @click="onClick"
  >
    <template #header>
      <img
        alt="document header"
        :src="displayIcon(document.mimeType)"
        class="document-image"
      />
    </template>
    <template #content>
      <div class="grid">
        <div
          v-tooltip.bottom="`${document.filename} Uploaded by ${document.createdByFullName}`"
          class="col-12 mb-0 text-left font-semibold text-overflow-ellipsis white-space-nowrap"
          style="overflow: hidden"
        >
          <a href="#">{{ document.filename }}</a>
        </div>
        <h6 class="col-8 text-left mt-0 mb-0 pt-0 pb-0">
          {{ formatDateLong(document.createdAt as string).split(',')[0] }},
        </h6>
        <h6 class="col-8 text-left mt-1 mb-0 pt-0 pb-0">
          {{ formatDateLong(document.createdAt as string).split(',')[1] }}
        </h6>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-content-between">
        <h6 class="col-4 text-left mt-0 mb-0 pl-0 inline-block">
          {{ filesize(document.filesize) }}
        </h6>
        <DeleteDocument :document="document" />
      </div>
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
  border-radius: 10px 10px 0 0;
}

:deep(.p-card-content) {
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.p-card-footer) {
  padding: 0;
  text-align: right;
}
:deep(.p-card-body) {
  padding-bottom: 0.4em;
  padding-top: 0.5em;
}
</style>
