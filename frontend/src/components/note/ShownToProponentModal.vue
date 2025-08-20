<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Dialog } from '@/lib/primevue';
import { formatDateLong } from '@/utils/formatters';

import type { NoteHistory } from '@/types';

// Props
const { noteHistory } = defineProps<{
  noteHistory: readonly NoteHistory[];
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <Dialog
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6/12"
    dismissable-mask
  >
    <template #header>
      <span class="p-dialog-title">{{ t('note.shownToProponentModal.attnReqd') }}</span>
    </template>

    <div
      v-for="history of noteHistory"
      :key="history.noteHistoryId"
      class="mb-5"
    >
      <div class="flex flex-col">
        <div class="font-bold mb-1">{{ formatDateLong(history.note?.[0]?.createdAt) }}</div>
        <div class="font-bold">{{ history.title }}</div>
        <div>{{ history.note?.[0]?.note }}</div>
      </div>
    </div>
  </Dialog>
</template>
