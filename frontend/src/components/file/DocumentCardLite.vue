<script setup lang="ts">
import { filesize } from 'filesize';
import { ref } from 'vue';

import DeleteDocument from '@/components/file/DeleteDocument.vue';
import { Card } from '@/lib/primevue';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Document } from '@/types';

// Props
const {
  deleteButton = true,
  selectable = false,
  selected = false
} = defineProps<{
  deleteButton?: boolean;
  document: Document;
  selectable?: boolean;
  selected?: boolean;
}>();

// Emits
const emit = defineEmits(['document:clicked']);

// State
const isSelected: Ref<boolean> = ref(selected);

// Actions

function onClick() {
  if (selectable) {
    isSelected.value = !isSelected.value;
    emit('document:clicked', { document: document, selected: isSelected.value });
  }
}
</script>

<template>
  <Card
    class="pb-1 text-center rounded-xl"
    :class="{ clicked: isSelected }"
    @click="onClick"
  >
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <div
          class="col-span-12 mb-0 text-left font-semibold text-ellipsis whitespace-nowrap mt-2"
          style="overflow: hidden"
          tabindex="0"
        >
          <span v-tooltip.bottom="`${document.filename} Uploaded by ${document.createdByFullName}`">
            <span v-tooltip.focus.bottom="`${document.filename} Uploaded by ${document.createdByFullName}`">
              <a href="#">
                {{ document.filename }}
              </a>
            </span>
          </span>
        </div>
        <h6 class="col-span-8 text-left mt-0 mb-0 pt-0 pb-0">
          {{ formatDateLong(document.createdAt as string).split(',')[0] }},
        </h6>
        <h6 class="col-span-8 text-left mt-1 mb-0 pt-0 pb-0">
          {{ formatDateLong(document.createdAt as string).split(',')[1] }}
        </h6>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between ml-4 mr-4 items-center">
        <h6 class="col-span-4 text-left mt-0 mb-0 pl-0 inline-block">
          {{ filesize(document.filesize) }}
        </h6>
        <DeleteDocument
          :document="document"
          :disabled="!deleteButton"
        />
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
