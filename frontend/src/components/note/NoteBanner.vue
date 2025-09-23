<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Button, Message } from '@/lib/primevue';
import { formatDate } from '@/utils/formatters';

import type { Note } from '@/types';

// Props
const { note } = defineProps<{
  note: Note;
}>();

// Emits
const emit = defineEmits(['noteBanner:show-history']);

// Composables
const { t } = useI18n();
</script>

<template>
  <Message
    v-if="note"
    severity="warn"
  >
    <div class="grid grid-cols-8 gap-4 items-center">
      <div class="col-span-3">
        <span class="font-bold mr-4">{{ t('note.noteBanner.attnReqd') }}:</span>
        <span class="font-bold">
          {{ t('note.noteBanner.updatedOn') }}
          {{ formatDate(note.createdAt) }}
        </span>
      </div>
      <div class="col-span-4 truncate">{{ note.note }}</div>
      <div class="flex justify-end">
        <Button
          size="small"
          :label="t('note.noteBanner.viewAll')"
          outlined
          @click="emit('noteBanner:show-history')"
        />
      </div>
    </div>
  </Message>
</template>

<style scoped lang="scss">
.p-button-outlined {
  background-color: white;
}
</style>
