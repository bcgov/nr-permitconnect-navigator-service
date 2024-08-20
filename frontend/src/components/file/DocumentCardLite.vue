<script setup lang="ts">
import { filesize } from 'filesize';
import { ref } from 'vue';

import DeleteDocument from '@/components/file/DeleteDocument.vue';
import { Card } from '@/lib/primevue';
import { formatDateLong } from '@/utils/formatters';

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

// State
const isSelected: Ref<boolean> = ref(props.selected);

// Actions

function onClick() {
  if (props.selectable) {
    isSelected.value = !isSelected.value;
    emit('document:clicked', { document: props.document, selected: isSelected.value });
  }
}
</script>

<template>
  <Card
    class="pb-1 text-center border-round-xl"
    :class="{ clicked: isSelected }"
    @click="onClick"
  >
    <template #content>
      <div class="grid">
        <div
          v-tooltip.bottom="`${props.document.filename} Uploaded by ${props.document.createdByFullName}`"
          class="col-12 mb-0 text-left font-semibold text-overflow-ellipsis white-space-nowrap mt-2"
          style="overflow: hidden"
        >
          <a href="#">{{ props.document.filename }}</a>
        </div>
        <h6 class="col-8 text-left mt-0 mb-0 pt-0 pb-0">
          {{ formatDateLong(props.document.createdAt as string).split(',')[0] }},
        </h6>
        <h6 class="col-8 text-left mt-1 mb-0 pt-0 pb-0">
          {{ formatDateLong(props.document.createdAt as string).split(',')[1] }}
        </h6>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-content-between ml-3 mr-3 align-items-center">
        <h6 class="col-4 text-left mt-0 mb-0 pl-0 inline-block">
          {{ filesize(props.document.filesize) }}
        </h6>
        <DeleteDocument
          :document="props.document"
          :disabled="!props.deleteButton"
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
